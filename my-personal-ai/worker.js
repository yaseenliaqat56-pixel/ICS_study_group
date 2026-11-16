const ALLOWED_ORIGIN = "https://yaseenliaqat56-pixel.github.io";
const MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_BODY = 6000;
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed" }, 403);
    const cors = { "access-control-allow-origin": ALLOWED_ORIGIN, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "Content-Type", "vary": "Origin" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "access-control-max-age": "600" } });
    const url = new URL(request.url);
    if (url.pathname !== "/api/chat") return json({ error: "Not found" }, 404, cors);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, { ...cors, allow: "POST, OPTIONS" });
    if (!env.AI) return json({ error: "AI binding is not configured" }, 503, cors);
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) return json({ error: "JSON required" }, 415, cors);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > MAX_BODY) return json({ error: "Request too large" }, 413, cors);
    if (env.RATE_LIMITER) {
      const key = request.headers.get("cf-connecting-ip") || "unknown";
      const { success } = await env.RATE_LIMITER.limit({ key });
      if (!success) return json({ error: "Too many requests. Please wait and try again." }, 429, cors);
    }
    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }
    const question = typeof body.question === "string" ? body.question.trim() : "";
    const language = body.language === "ur" ? "ur" : "en";
    if (!question || question.length > 1200) return json({ error: "Question must be between 1 and 1200 characters" }, 400, cors);
    const system = language === "ur"
      ? "آپ My Personal AI کے مددگار معاون ہیں۔ مختصر، واضح اور محفوظ اردو میں جواب دیں۔ صارف کم عمر ہو سکتا ہے: عمر کے مطابق جواب دیں، خطرناک کام، ذاتی معلومات یا غیر محفوظ مشورے نہ دیں۔ طبی، قانونی یا مالی فیصلوں کے لیے قابل اعتماد بالغ اور مستند ماہر سے رجوع کرنے کا کہیں۔ غیر یقینی بات کو واضح کریں۔"
      : "You are the helpful assistant inside My Personal AI. Be clear, practical and concise. The user may be a minor: keep responses age-appropriate, do not encourage dangerous activities or sharing personal data. For medical, legal or financial decisions, recommend a trusted adult and qualified professional. Be transparent about uncertainty.";
    try {
      const result = await env.AI.run(MODEL, {
        messages: [{ role: "system", content: system }, { role: "user", content: question }],
        max_tokens: 500
      });
      const answer = typeof result === "string" ? result : (result.response || result.output_text || "");
      if (!answer) return json({ error: "The AI service returned no answer" }, 502, cors);
      return json({ answer: String(answer).slice(0, 5000) }, 200, cors);
    } catch {
      return json({ error: "AI service is temporarily unavailable" }, 502, cors);
    }
  }
};
