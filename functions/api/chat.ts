export const onRequestPost: PagesFunction = async (ctx) => {
  try {
    const { prompt, systemInstruction, temperature, model } = await ctx.request.json();

    const apiKey = ctx.env.GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-1.5-flash"}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: { temperature: temperature ?? 0.7 },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: data?.error?.message || "Gemini API error" }), {
        status: r.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ||
      "（无返回文本）";

    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
