/**
 * FORGE ENGINE - Content Generator
 * Dedicated script for prompt engineering and contacting Local AI (Ollama) for marketing content.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api";
const MODEL_NAME = process.env.OLLAMA_MODEL || "llama3";

export interface GeneratePostRequest {
  topic: string;
  platform: "Twitter" | "Instagram" | "LinkedIn" | "TikTok";
  tone: "Viral" | "Sales" | "Corporate";
}

export async function generateMarketingPost(data: GeneratePostRequest): Promise<string> {
  let tonePrompt = "";
  if (data.tone === "Sales") tonePrompt = "ركز على البيع، استخدم اسلوب Call To Action قوي ومقنع للعميل للشراء أو الحجز.";
  if (data.tone === "Viral") tonePrompt = "استخدم نبرة مرحة، تفاعلية، تثير الفضول وتدفع الناس للتعليق واعادة النشر (Viral Hook).";
  if (data.tone === "Corporate") tonePrompt = "نبرة مؤسسية احترافية، تعكس الثقة والوضوح (B2B).";

  const prompt = `
أنت خبير كتابة محتوى إبداعي في وكالة تسويق رقمي. مهمتك كتابة منشور احترافي ومميز بـ اللغة العربية.

المنصة المستهدفة: ${data.platform}
الموضوع/المنتج: ${data.topic}
أسلوب الكتابة: ${tonePrompt}

قواعد صارمة:
- لا تقم بكتابة مقدمات طويلة مثل "بالتأكيد سأقوم بكتابة...". أعطني المحتوى النهائي مباشرة.
- راعِ تنسيق الجمل (استخدم الإيموجي المناسب).
- أضف مساحات بيضاء بين الفقرات لسهولة القراءة.
- اختم بـ 3 هاشتاقات ذات صلة.
  `;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Factory failed: ${response.statusText}`);
    }

    const { response: aiText } = await response.json();
    return aiText.trim();
  } catch (error) {
    console.error("FORGE (Ollama) Generation Error:", error);
    throw new Error("لم نتمكن من الاتصال بـ Ollama. هل تأكدت من تشغيل خادم الذكاء الاصطناعي محلياً على المنفذ 11434؟");
  }
}
