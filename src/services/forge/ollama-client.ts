/**
 * FORGE ENGINE - Local AI Integration (Ollama)
 * Responsible for evaluating leads, scoring them, and generating marketing ideas.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api";
const MODEL_NAME = process.env.OLLAMA_MODEL || "llama3";

export interface LeadScoreResult {
  score: number;       // 0 - 100
  reasoning: string;   // Why this score was given
}

/**
 * Calls the local Ollama instance to analyze a scraped lead and give it a readiness score.
 */
export async function scoreLeadWithAI(companyName: string, hasWebsite: boolean, hasPhone: boolean, rating: number = 0, reviewsCount: number = 0): Promise<LeadScoreResult> {
  const prompt = `
أنت محلل محترف في وكالة تسويق رقمي. مهمتك تقييم هذا العميل المحتمل من 0 إلى 100 بناءً على جودته واحتمالية بيع خدمات تسويقية له.
الشركة: ${companyName}
لديه موقع إلكتروني؟ ${hasWebsite ? "نعم" : "لا"}
لديه رقم هاتف معلن؟ ${hasPhone ? "نعم" : "لا"}
التقييم العام: ${rating}/5 (بناءً على ${reviewsCount} مراجعة)

إذا لم يكن لديه موقع إلكتروني أو هاتفه غير متوفر، يجب أن يكون التقييم أقل. 
إذا كان تقييمه منخفضاً والمراجعات قليلة، فهذه فرصة ممتازة لنقدم له خدمة "إدارة السمعة" (سمعة ضعيفة = فرصة قوية).

قم بإرجاع إجابتك بصيغة JSON فقط:
{
  "score": (الرقم من 0 لـ 100),
  "reasoning": (سبب التقيم في جملتين باللغة العربية)
}
  `;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        format: "json",
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama failed: ${response.statusText}`);
    }

    const { response: aiText } = await response.json();
    const result = JSON.parse(aiText);
    return {
      score: result.score || 0,
      reasoning: result.reasoning || "لا يوجد تبرير",
    };
  } catch (error) {
    console.error("FORGE (Ollama) Scoring Error:", error);
    // Fallback if local AI fails
    return { score: 10, reasoning: "فشل الاتصال بالذكاء الاصطناعي (Ollama)" };
  }
}
