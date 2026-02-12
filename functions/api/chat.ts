export async function onRequestPost(context: any) {
  try {
    const { prompt, systemInstruction, temperature, model } = await context.request.json();

    const apiKey = context.env.GEMINI_API_KEY; // ✅ Pages Functions 用 runtime env
    if (!apiKey) {
      return new Response(JSON.stringify({ text: "GEMINI_API_KEY 未配置" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction || ""}\n\n${prompt || ""}` }],
            },
          ],
          generationConfig: { temperature: temperature ?? 0.7 },
        }),
      }
    );

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI 无返回";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ text: "API 错误: " + e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
