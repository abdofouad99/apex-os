import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedContent {
  title: string;
  body: string;
  platform: string;
}

export async function generateMarketingContent(
  topic: string,
  platform: string,
  tone: string,
  audience?: string,
  useMock: boolean = false
): Promise<GeneratedContent[]> {

  const apiKey = process.env.GEMINI_API_KEY;
  // 1. Mock Mode (Fallback & Demo)
  if (useMock || !apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return generateMockContent(topic, platform, tone);
  }

  // 2. Real AI Mode (Gemini Integration)
  const systemPrompt = `You are an elite Marketing Copywriter working in a Top-Tier Middle Eastern Agency.
Write professional and highly converting ad copy strictly in ARABIC language.

Context:
- Platform: ${platform}
- Tone of Voice: ${tone}
- Target Audience: ${audience || 'General public'}
- Subject: ${topic}

Rules for the output:
- GENERATE EXACTLY 3 entirely unique, highly creative variants.
- Format the response as a RAW JSON array of objects.
- Do NOT wrap in \`\`\`json or \`\`\` blocks, just output the raw JSON array.
- Each object strictly needs:
   "title": A super catchy, short title or hook.
   "body": The full ad copy, richly formatted with culturally relevant Arabic phrasing, structure, spacing, and appropriate emojis for the named platform.

Example JSON:
[
  { "title": "...", "body": "..." },
  { "title": "...", "body": "..." },
  { "title": "...", "body": "..." }
]`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Clean potential markdown blocks
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    let jsonOutput = JSON.parse(cleanedText);
    
    if (!Array.isArray(jsonOutput)) {
      if (jsonOutput.variants) jsonOutput = jsonOutput.variants;
      else jsonOutput = [jsonOutput];
    }
    
    return jsonOutput.map((item: any) => ({
      title: item.title || "فكرة إبداعية",
      body: item.body || item.content || "",
      platform: platform
    }));

  } catch (error) {
    console.error("Gemini AI Generation Error:", error);
    // Fallback to mock on connection/parse error to ensure UI never completely breaks
    return generateMockContent(topic, platform, tone);
  }
}

function generateMockContent(topic: string, platform: string, tone: string): GeneratedContent[] {
  return [
    {
      title: "النهج المباشر (Direct)",
      body: `🚀 تحذير: فرصة لا تعوّض!\nهل تعبت من البحث عن أفضل الخيارات لـ (${topic})؟\nالآن وبكل ثقة، نقدم لك الحل الذي سيغير اللعبة بالكامل.\n\nلماذا نحن؟\n✅ أداء فائق \n✅ جودة مرجعية \n✅ ضمان كامل\n\nلا تفوت الفرصة، تواصل معنا اليوم وارتقِ بتجربتك! 👇\n[رابط موقعك هنا]`,
      platform
    },
    {
      title: "الخطاف العاطفي (Emotional Hook)",
      body: `أحياناً نحتاج فقط إلى من يفهم متطلباتنا ويقدم لنا الدعم الحقيقي 💔\nإذا كان موضوع (${topic}) يشغل تفكيرك، فنحن هنا لنخبرك أنك لست وحدك.\nلقد صممنا خدمتنا خصيصاً لتمنحك راحة البال التي تستحقها واهتماماً لا مثيل له.\n\n✨ لأنك تستحق الأفضل دائماً.\nاضغط لمعرفة كيف يمكننا مساعدتك اليوم!`,
      platform
    },
    {
      title: "نبرة الكوميديا (Humor)",
      body: `البعض يبحث عن (${topic}) وكأنه يبحث عن إبرة في كومة قش! 😂\nلكن لماذا التعب والبحث الطويل ونحن موجودون؟\nوفر مجهودك وبطاريتك، واترك الباقي علينا!\n\nاضغط هنا قبل أن تطير العروض كما تطير رواتبنا آخر الشهر 💸🏃‍♂️\n[الرابط]`,
      platform
    }
  ];
}
