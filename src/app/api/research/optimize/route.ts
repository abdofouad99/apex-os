import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// AutoResearch — Karpathy-style optimization loops
// Based on ai-marketing-skills/autoresearch
export async function POST(req: Request) {
  try {
    const { content, contentType = "ad", topic, industry } = await req.json();
    if (!content && !topic) return NextResponse.json({ success: false, error: "الرجاء إدخال النص أو الموضوع" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const EXPERTS = [
      "مدير التسويق (CMO): هل يجذب انتباهي فوراً؟",
      "مؤسس متشكك: هل أصدق هذا؟ هل أثق بالشركة؟",
      "خبير تحويل (CRO): هل واضح ومحرك للعمل؟",
      "كاتب إعلاني أول: هل مقنع ومميز ومحترف؟",
      "عميل محتمل عربي: هل يخاطبني بأسلوبي وثقافتي؟",
    ];

    // Round 1: Generate 10 variants & score
    const round1Prompt = `أنت محرك autoresearch تسويقي. المهمة: توليد 10 متغيرات لنص تسويقي عربي وتقييمها بـ 5 خبراء.

النص الأصلي:
"""
${content || `أنشئ محتوى تسويقياً قوياً عن: ${topic} (${contentType}) في قطاع ${industry || "التسويق"}`}
"""

نوع المحتوى: ${contentType}
القطاع: ${industry || "عام"}

المطلوب:
1. اكتب 10 متغيرات مختلفة للنص (موجزة وقوية)
2. قيّم كل متغير بـ 5 خبراء (0-100)
3. احسب المتوسط

الخبراء: ${EXPERTS.join(" | ")}

التنسيق المطلوب (بالضبط):
V1: [النص كاملاً]
SCORES_V1: [CMO]/[متشكك]/[CRO]/[كاتب]/[عميل] AVG:[متوسط]
V2: [النص كاملاً]
SCORES_V2: [CMO]/[متشكك]/[CRO]/[كاتب]/[عميل] AVG:[متوسط]
...وهكذا حتى V10`;

    const r1 = await model.generateContent(round1Prompt);
    const r1Text = r1.response.text();

    // Parse variants from round 1
    const variants: { text: string; avg: number; scores: number[] }[] = [];
    for (let i = 1; i <= 10; i++) {
      const textMatch = r1Text.match(new RegExp(`V${i}:\\s*([\\s\\S]*?)(?=SCORES_V${i}:|$)`))?.[1]?.trim();
      const scoresMatch = r1Text.match(new RegExp(`SCORES_V${i}:\\s*([\\d/]+)\\s*AVG:(\\d+)`))?.[0];
      const avg = parseInt(r1Text.match(new RegExp(`SCORES_V${i}:.*AVG:(\\d+)`))?.[1] || "70");
      if (textMatch) variants.push({ text: textMatch, avg, scores: [] });
    }

    // Sort by avg and keep top 3
    variants.sort((a, b) => b.avg - a.avg);
    const top3 = variants.slice(0, 3);

    // Round 2: Evolve top 3 into 10 new variants
    const round2Prompt = `استناداً لأفضل 3 متغيرات:

${top3.map((v, i) => `الفائز ${i + 1}: "${v.text}" (${v.avg}/100)`).join("\n")}

حلّل ما جعلها الأفضل، ثم اكتب 5 متغيرات جديدة تطوّر من نقاط قوتها بشكل مبتكر.

التنسيق:
EVO_1: [النص المطوّر]
SCORE_EVO_1: [رقم 0-100]
REASON_1: [سبب التطوير]
EVO_2: [النص]
SCORE_EVO_2: [رقم]
REASON_2: [سبب]
EVO_3: [النص]
SCORE_EVO_3: [رقم]
REASON_3: [سبب]
EVO_4: [النص]
SCORE_EVO_4: [رقم]
REASON_4: [سبب]
EVO_5: [النص]
SCORE_EVO_5: [رقم]
REASON_5: [سبب]`;

    const r2 = await model.generateContent(round2Prompt);
    const r2Text = r2.response.text();

    // Parse evolved variants
    const evolved: { text: string; score: number; reason: string }[] = [];
    for (let i = 1; i <= 5; i++) {
      const text = r2Text.match(new RegExp(`EVO_${i}:\\s*([\\s\\S]*?)(?=SCORE_EVO_${i}:)`))?.[1]?.trim();
      const score = parseInt(r2Text.match(new RegExp(`SCORE_EVO_${i}:\\s*(\\d+)`))?.[1] || "75");
      const reason = r2Text.match(new RegExp(`REASON_${i}:\\s*([^\\n]+)`))?.[1]?.trim();
      if (text) evolved.push({ text, score, reason: reason || "" });
    }

    evolved.sort((a, b) => b.score - a.score);
    const winner = evolved[0] || top3[0];

    return NextResponse.json({
      success: true,
      winner: { text: winner.text, score: (winner as any).score || (winner as any).avg },
      top3Initial: top3.slice(0, 3),
      evolved: evolved.slice(0, 5),
      rounds: 2,
      improvement: Math.max(0, ((winner as any).score - top3[0].avg)),
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
