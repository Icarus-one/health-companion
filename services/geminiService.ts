export const generateWeeklyReport = async (logs: DailyLog[]): Promise<string> => {
  if (logs.length < 3) return "记录数据不足。";

  const dataString = logs.slice(-15).map((log) => {
    const d = new Date(log.date);
    const timeStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
    return `[${timeStr}] 睡眠:${log.sleepQuality}, 精力:${log.energyLevel}, 情绪:${log.moodStatus}, 肠胃:${log.gastroStatus}${
      log.symptoms ? `, 观察: "${log.symptoms}"` : ""
    }`;
  }).join("\n");

  const prompt = `
作为健康分析官，请基于以下【非定点时序数据】生成深度洞察报告。

记录列表：
${dataString}

核心分析任务：
1. **时序分布表**：总结【记录密度 | 关键波动时段 | 核心症状出现时刻 | 指标均值】。
2. **时空规律挖掘**：找出精力/情绪/肠胃的波动规律与可能诱因。
3. **因果与干预**：结合中西医理论给出可执行的“微干预”建议（按时间点行动）。
`;

  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
        model: "gemini-1.5-flash",
      }),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data?.error || "API error");

    return data?.text || "报告生成失败。";
  } catch (e) {
    return "分析过程中出现错误。";
  }
};
