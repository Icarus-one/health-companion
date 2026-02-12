import { DailyLog, ChatMessage } from "../types";
import { RED_FLAG_KEYWORDS } from "../constants";

export const checkRedFlag = (input: string): boolean => {
  return RED_FLAG_KEYWORDS.some((keyword) => input.includes(keyword));
};

const SYSTEM_INSTRUCTION = `
你是一个专业的“中西医结合”长期健康分析官。
你的回复必须直接呈现结果，不要解释你的工作流程。

关键原则：
1) 时序敏感性：用户记录的时间戳不均匀。你必须分析记录之间的时间跨度与波动。
2) 频率分析：记录频率变化可作为自我关注度/压力状态的隐性指标。
3) 输出规范：使用标准 GFM；涉及对比时用表格。语气：客观、专业、有洞察。
`;

type ChatAPIResponse = { text?: string; error?: string };

async function callAI(params: {
  prompt: string;
  temperature: number;
  model?: string;
  systemInstruction?: string;
}): Promise<string> {
  const r = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: params.prompt,
      systemInstruction: params.systemInstruction ?? SYSTEM_INSTRUCTION,
      temperature: params.temperature,
      model: params.model ?? "gemini-1.5-flash",
    }),
  });

  let data: ChatAPIResponse | null = null;
  try {
    data = (await r.json()) as ChatAPIResponse;
  } catch {
    // 如果后端没返回 JSON
    data = null;
  }

  if (!r.ok) {
    // 尽量把后端错误透出来（方便你排查 key / model / quota）
    const msg = data?.error || `AI 服务错误（HTTP ${r.status}）`;
    throw new Error(msg);
  }

  return data?.text?.trim() || "理解中...";
}

function formatLogsForPrompt(history: DailyLog[], limit = 15): string {
  const recent = history.slice(-limit);
  if (recent.length === 0) return "（无记录）";

  // 这里不用 toLocaleString 也可以，但它对国际用户会因时区/语言略不同；
  // 这里保留它方便直观，AI 也能理解。
  return recent
    .map((log) => {
      const d = new Date(log.date);
      return `[时间:${d.toLocaleString()}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 肠胃:${log.gastroStatus}${
        log.symptoms ? `, 症状:${log.symptoms}` : ""
      }`;
    })
    .join("\n");
}

function formatChatForPrompt(chatHistory: ChatMessage[], limit = 12): string {
  const recent = chatHistory.slice(-limit);
  if (recent.length === 0) return "（无对话历史）";
  return recent
    .map((m) => `${m.role === "user" ? "用户" : "助手"}: ${m.content}`)
    .join("\n");
}

export const getAIResponse = async (
  userInput: string,
  history: DailyLog[],
  chatHistory: ChatMessage[]
): Promise<{ text: string }> => {
  if (checkRedFlag(userInput)) {
    return { text: "🚨 **风险警示**：你描述的症状可能涉及急性健康风险，请立即就医。" };
  }

  const logsText = formatLogsForPrompt(history, 15);
  const chatText = formatChatForPrompt(chatHistory, 12);

  const prompt = `
用户近期健康记录（非均匀时序）：
${logsText}

近期对话摘要（用于上下文）：
${chatText}

用户当前提问：
"${userInput}"

分析要求（必须执行）：
1) 时序：识别记录之间是否存在“同日多次记录”的波动、或“多天断档”的信息缺口，并点名指出。
2) 关联：把睡眠/精力/情绪/肠胃与症状出现的时间点联系起来（如清晨、深夜、餐后）。
3) 输出：
   - 用要点给出【结论】
   - 给出【可能机制：西医 + 中医】（简洁但有逻辑）
   - 给出【3条微干预】（必须包含“具体时间点/场景”的行动建议）
   - 如信息不足：列出【追问清单】（最多5条）
`;

  try {
    const text = await callAI({
      prompt,
      temperature: 0.7,
      model: "gemini-1.5-flash",
    });
    return { text };
  } catch (e: any) {
    // 你如果想在 UI 显示更具体的错误，可以把 e.message 打到 console
    console.error("getAIResponse error:", e?.message || e);
    return { text: "AI 服务暂时不可用，请稍后再试。" };
  }
};

export const generateWeeklyReport = async (logs: DailyLog[]): Promise<string> => {
  if (logs.length < 3) return "记录数据不足。";

  const dataString = logs
    .slice(-15)
    .map((log) => {
      const d = new Date(log.date);
      return `[时间:${d.toLocaleString()}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 情绪:${log.moodStatus}, 肠胃:${log.gastroStatus}${
        log.symptoms ? `, 观察:${log.symptoms}` : ""
      }`;
    })
    .join("\n");

  const prompt = `
作为健康分析官，请基于以下【非定点时序数据】生成周期分析报告（标准 GFM）。

记录列表：
${dataString}

输出结构（必须按此顺序）：
1) **时序分布表**：用表格总结【记录密度 | 关键波动时段 | 核心症状出现时刻 | 指标均值/趋势】
2) **规律与风险**：找出 2-4 条最关键的规律与风险点（包含中西医解释）
3) **干预建议**：至少 5 条，其中 3 条必须是“微干预”（带具体时间/场景）
4) **下周追踪指标**：给出 3 个可量化指标（例如睡眠评分、餐后胀气次数、晚间入睡时长）
`;

  try {
    const text = await callAI({
      prompt,
      temperature: 0.8,
      model: "gemini-1.5-flash",
    });
    return text;
  } catch (e: any) {
    console.error("generateWeeklyReport error:", e?.message || e);
    return "分析过程中出现错误。";
  }
};
