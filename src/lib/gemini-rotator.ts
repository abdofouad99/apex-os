const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_KEY = process.env.GROQ_API_KEY || "";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/api";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY_1 || "",
  process.env.GEMINI_API_KEY_2 || ""
].filter(Boolean);

if (GEMINI_KEYS.length === 0) {
  console.warn("⚠️ No Gemini keys configured. Will use Groq → Ollama fallback.");
}
if (!GROQ_KEY) {
  console.warn("⚠️ GROQ_API_KEY not configured. Will skip Groq fallback.");
}

export interface GeminiCallOptions {
  model?: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
  keyIndex?: number;
  source?: "gemini" | "groq" | "ollama";
}

/**
 * Attempts Gemini API with key rotation → falls back to Groq → then Ollama.
 * Chain: GEMINI_API_KEY_1 → GEMINI_API_KEY_2 → Groq (llama-3.3-70b) → Ollama (local)
 */
export async function callGeminiWithFallback(
  options: GeminiCallOptions
): Promise<GeminiResponse> {
  const {
    model = "gemini-2.0-flash",
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxOutputTokens = 2048
  } = options;

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: { temperature, maxOutputTokens }
  };

  // ── Phase 1: Try all Gemini keys ──
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[i];
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${key}`;

    console.log(`🔑 Trying Gemini key #${i + 1}...`);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 429 || res.status === 403) {
        const errorBody = await res.json().catch(() => null);
        console.warn(`⚠️ Key #${i + 1} quota exceeded (${res.status}). Rotating...`);
        continue;
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        console.error(`❌ Gemini error (key #${i + 1}):`, errorBody?.error?.message);
        return {
          success: false,
          error: `خطأ من Gemini (${res.status}): ${errorBody?.error?.message || "خطأ غير محدد"}`
        };
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error(`❌ Invalid Gemini response (key #${i + 1})`);
        return {
          success: false,
          error: "فشل الذكاء الاصطناعي في توليد الرد."
        };
      }

      console.log(`✅ Gemini responded (key #${i + 1})`);
      return { success: true, text, keyIndex: i, source: "gemini" };

    } catch (err: any) {
      console.warn(`⚠️ Network error with key #${i + 1}:`, err.message);
      continue;
    }
  }

  // ── Phase 2: Gemini exhausted → Fall back to Groq ──
  if (GEMINI_KEYS.length > 0) {
    console.warn(`⚠️ All Gemini keys exhausted → Falling back to Groq (${GROQ_MODEL})...`);
  }

  if (GROQ_KEY) {
    try {
      const groqRes = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature,
          max_tokens: maxOutputTokens
        })
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const text = data?.choices?.[0]?.message?.content;

        if (text) {
          console.log(`✅ Groq responded (${GROQ_MODEL})`);
          return { success: true, text, source: "groq" };
        }
      } else {
        const errBody = await groqRes.json().catch(() => null);
        console.warn(`⚠️ Groq failed (${groqRes.status}):`, errBody?.error?.message);
      }
    } catch (err: any) {
      console.warn("⚠️ Groq network error:", err.message);
    }
  }

  // ── Phase 3: Groq exhausted → Fall back to Ollama ──
  console.warn(`⚠️ Groq failed → Falling back to local Ollama (${OLLAMA_MODEL})...`);

  try {
    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\n---\n\nالمستخدم: ${userPrompt}`,
        stream: false,
        options: { temperature, num_predict: maxOutputTokens }
      })
    });

    if (!ollamaRes.ok) {
      const errBody = await ollamaRes.json().catch(() => null);
      console.error(`❌ Ollama error:`, errBody);
      return {
        success: false,
        error: `فشل Ollama: ${errBody?.error || "خطأ غير محدد"}`
      };
    }

    const data = await ollamaRes.json();
    const text = data?.response;

    if (!text) {
      console.error("❌ Empty Ollama response:", JSON.stringify(data, null, 2).substring(0, 300));
      return {
        success: false,
        error: "لم يتم توليد رد من النموذج المحلي."
      };
    }

    console.log(`✅ Ollama responded (${OLLAMA_MODEL})`);
    return { success: true, text, source: "ollama" };

  } catch (err: any) {
    console.error("❌ Ollama connection failed:", err.message);
    return {
      success: false,
      error: "فشل الاتصال بكل من Gemini وGroq وOllama."
    };
  }
}
