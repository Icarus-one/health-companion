import { DailyLog, ChatMessage } from "../types";
import { RED_FLAG_KEYWORDS } from "../constants";

export const checkRedFlag = (input: string): boolean => {
  return RED_FLAG_KEYWORDS.some(keyword => input.includes(keyword));
};

const SYSTEM_INSTRUCTION = `
你是一个专业的“中西医结合”长期健康分析官。
你的回复必须直接呈现结果，不要解释你的工作流程。
语气：客观、专业、有洞察。
`;

export const getAIResponse = async (
  userInput: string,
  history: DailyLog[],
  chatHistory: ChatMessage[]
): Promise<{ text: string }> => {

  if (checkRedFlag(userInput)) {
    return {
      text: "🚨 风险警示：症状可能涉及急性健康风险，请立即就医。"
    };
  }

  const recentLogs = history.slice(-15).map(log => {
    const d = new Date(log.date);
    return `[${d.toLocaleString()}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 肠胃:${log.gastroStatus}${log.symptoms ? `, 症状:${log.symptoms}` : ''}`;
  }).join("\n");

  const prompt = `
用户近期记录：
${recentLogs}

用户问题：
${userInput}

请结合时序变化进行健康分析并给出干预建议。
`;

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        model: "gemini-1.5-flash"
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return { text: "AI 服务暂时不可用，请稍后再试。" };
    }

    return { text: data.text || "理解中..." };

  } catch (e) {
    return { text: "网络连接异常，请稍后重试。" };
  }
};

export const generateWeeklyReport = async (logs: DailyLog[]): Promise<string> => {
  if (logs.length < 3) return "记录数据不足。";

  const dataString = logs.slice(-15).map(log => {
    const d = new Date(log.date);
    return `[${d.toLocaleString()}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 情绪:${log.moodStatus}, 肠胃:${log.gastroStatus}${log.symptoms ? `, 观察:${log.symptoms}` : ''}`;
  }).join("\n");

  const prompt = `
基于以下健康记录生成一份周期分析报告：
${dataString}

请输出：
1. 规律总结
2. 风险判断
3. 干预建议
`;

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        model: "gemini-1.5-flash"
      })
    });

    const data = await r.json();
    return data?.text || "报告生成失败。";

  } catch (e) {
    return "分析过程中出现错误。";
  }
};
