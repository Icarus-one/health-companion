export async function onRequestPost(context: any) {
  try {
    const { prompt, systemInstruction, temperature, model } =
      await context.request.json();

    const apiKey = context.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ text: "服务器未配置 GEMINI_API_KEY" }),
        { status: 500 }
      );
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`;

    const body = {
      system_instruction: {
        parts: [{ text: systemInstruction || "你是健康分析助手。" }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: temperature ?? 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const raw = await resp.text();
    console.log("Gemini raw:", raw);

    if (!resp.ok) {
      return new Response(
        JSON.stringify({ text: "Gemini API 请求失败" }),
        { status: 500 }
      );
    }

    const data = JSON.parse(raw);

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "模型没有返回内容";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ text: "Worker 内部错误: " + e.message }),
      { status: 500 }
    );
  }
}
