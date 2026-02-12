
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DailyLog, ChatMessage } from "../types";
import { RED_FLAG_KEYWORDS } from "../constants";

// 初始化：直接使用 process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEDICAL_KNOWLEDGE_BASE: Record<string, any> = {
  "胃胀": {
    wm: "多与胃动力不足、消化酶分泌减少 or 幽门螺杆菌感染有关。需注意餐后活动。",
    tcm: "多属‘痞满’范畴。常见脾虚气滞或寒热错杂。建议按揉足三里，少吃生冷。",
    intervention: "观察症状与进食时间的距离，晚餐尝试减少20%摄入量。"
  },
  "失眠": {
    wm: "涉及中枢神经系统兴奋抑制失调。需关注蓝光暴露及皮质醇节律。",
    tcm: "关乎‘心肾不交’或‘肝火旺盛’。建议睡前温水泡脚，按揉神门穴。",
    intervention: "建立固定的睡眠仪式，记录睡前具体的活动类型。"
  }
};

export const checkRedFlag = (input: string): boolean => {
  return RED_FLAG_KEYWORDS.some(keyword => input.includes(keyword));
};

const SYSTEM_INSTRUCTION = `
你是一个专业的“中西医结合”长期健康分析官。
你的回复必须直接呈现结果，不要解释你的工作流程。

关键原则：
1. **时序敏感性**：用户记录的时间戳是不均匀的。你必须分析记录之间的“时间跨度”。例如：一天内多次记录暗示症状在剧烈波动；数天无记录后的突然记录暗示了新的诱因。
2. **频率分析**：分析用户记录的积极程度，将其作为评估“自我关注度”和“压力状态”的隐性指标。
3. **输出规范**：使用标准 GFM。涉及数据对比时必须使用表格。语气：客观、专业、有深度洞察。
`;

export const getAIResponse = async (
  userInput: string,
  history: DailyLog[],
  chatHistory: ChatMessage[]
): Promise<{ text: string; sources?: string[] }> => {
  
  if (checkRedFlag(userInput)) {
    return { text: "🚨 **风险警示**：你描述的症状可能涉及急性健康风险。请立即前往医院急诊科就诊。若伴有呼吸困难或剧烈疼痛，请立即拨打120。" };
  }

  const recentLogs = history.slice(-15).map(log => {
    const d = new Date(log.date);
    const timeStr = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    return `[时间:${timeStr}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 肠胃:${log.gastroStatus}${log.symptoms ? `, 症状: ${log.symptoms}` : ''}`;
  }).join('\n');

  const prompt = `
用户近期详细时序记录：
${recentLogs}

用户当前提问："${userInput}"

分析要求：
1. 请注意记录中的具体时间。如果用户在一天内多次记录了某个症状，请分析其波动的规律。
2. 结合记录时的时间点（如深夜记录、清晨记录）提供针对性的中西医分析。
3. 如果数据存在断档（多天未记录），请在分析中指出这一点可能导致的信息缺失。
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return { 
      text: response.text || "理解中...", 
    };
  } catch (error) {
    return { text: "网络连接不稳定，请稍后重试。" };
  }
};

export const generateWeeklyReport = async (logs: DailyLog[]): Promise<string> => {
  if (logs.length < 3) return "记录数据不足。";
  
  const dataString = logs.slice(-15).map(log => {
    const d = new Date(log.date);
    const timeStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    return `[${timeStr}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 情绪:${log.moodStatus}, 肠胃:${log.gastroStatus}${log.symptoms ? `, 观察: "${log.symptoms}"` : ''}`;
  }).join('\n');

  const prompt = `
作为健康分析官，请基于以下【非定点时序数据】生成深度洞察报告。

记录列表：
${dataString}

核心分析任务：
1. **时序分布表**：总结【记录密度 | 关键波动时段 | 核心症状出现时刻 | 指标均值】。
2. **时空规律挖掘**：
   - 是否存在特定时段（如每天下午）精力明显下降？
   - 记录频率的变化是否反映了用户的情绪或身体敏感度？
   - 症状出现的时间与睡眠分数是否有滞后相关性？
3. **因果与干预**：运用中西医理论解释。建议必须包含“微干预”（针对特定时间的行动）。

直接输出报告内容，禁止使用代码块包裹。
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8
      },
    });
    return response.text || "报告生成失败。";
  } catch (e) {
    return "分析过程中出现错误。";
  }
};
