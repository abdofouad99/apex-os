import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

// ============================================================
// APEX Expert Panel — Powered by ai-marketing-skills (content-ops)
// 9 Arabic marketing experts evaluate & improve content to 90+/100
// ============================================================

const EXPERTS = [
  { name: "خبير الخطاف (Hook Specialist)", focus: "هل يجذب السطر الأول الانتباه خلال 3 ثوانٍ؟ هل يثير فضول؟", weight: 1.5 },
  { name: "خبير الإقناع (Copywriter)", focus: "قوة الصياغة، وضوح العرض، دعوة قوية للعمل (CTA)", weight: 1.3 },
  { name: "خبير التحويل (Conversion Expert)", focus: "هل يدفع القارئ للشراء أو التسجيل؟ هل العرض واضح؟", weight: 1.2 },
  { name: "خبير الثقافة العربية", focus: "هل يتناسب مع الثقافة المحلية؟ المصطلحات، النبرة، القيم", weight: 1.2 },
  { name: "كاشف الذكاء الاصطناعي (AI Detector)", focus: "هل يبدو طبيعياً أم مصطنعاً؟ يُعاقب على التعابير الآلية", weight: 1.5 },
  { name: "خبير العروض (Offer Specialist)", focus: "هل العرض مغري وواضح؟ الخصم، القيمة، الإلحاح", weight: 1.0 },
  { name: "خبير الوضوح (Clarity Expert)", focus: "هل الرسالة واضحة ومباشرة؟ لا لبس في الفهم", weight: 1.0 },
  { name: "خبير المشاعر (Emotional Resonance)", focus: "هل يثير مشاعر: فرح، خوف، تطلع، فضول؟", weight: 1.0 },
  { name: "خبير صوت العلامة (Brand Voice)", focus: "هل الأسلوب متسق واحترافي ويعزز الثقة؟", weight: 0.8 },
];

const TOTAL_WEIGHT = EXPERTS.reduce((sum, e) => sum + e.weight, 0);

export async function POST(req: Request) {
  try {
    const { text, contentType = "ad", contentIdeaId } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json({ success: false, error: "النص قصير جداً للتقييم" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY غير مُكوَّن" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let currentText = text;
    let allRounds: any[] = [];
    let finalScore = 0;
    let roundCount = 0;
    const MAX_ROUNDS = 3;
    const TARGET_SCORE = 85;

    // ============================================================
    // RECURSIVE SCORING LOOP — Max 3 rounds until 85+/100
    // ============================================================
    while (roundCount < MAX_ROUNDS) {
      roundCount++;

      const expertListText = EXPERTS.map((e, i) =>
        `${i + 1}. ${e.name} (وزن: ${e.weight}x): ${e.focus}`
      ).join("\n");

      const scoringPrompt = `أنت لجنة من ${EXPERTS.length} خبراء تسويق متخصصين. قيّموا هذا المحتوى (${contentType}) بدقة تامة ومن دون محاباة.

المحتوى المراد تقييمه:
"""
${currentText}
"""

الخبراء وتخصصاتهم:
${expertListText}

المطلوب:
1. قيّم كل خبير المحتوى من 0-100 بناءً على تخصصه فقط
2. اذكر ملاحظة واحدة مختصرة لكل خبير
3. احسب المتوسط المرجح
4. اذكر أهم 3 نقاط ضعف
5. قدّم نسخة محسّنة من المحتوى تعالج نقاط الضعف

أجب بهذا التنسيق الدقيق:
SCORES:
خبير الخطاف (Hook Specialist): [رقم]|[ملاحظة مختصرة]
خبير الإقناع (Copywriter): [رقم]|[ملاحظة مختصرة]
خبير التحويل (Conversion Expert): [رقم]|[ملاحظة مختصرة]
خبير الثقافة العربية: [رقم]|[ملاحظة مختصرة]
كاشف الذكاء الاصطناعي (AI Detector): [رقم]|[ملاحظة مختصرة]
خبير العروض (Offer Specialist): [رقم]|[ملاحظة مختصرة]
خبير الوضوح (Clarity Expert): [رقم]|[ملاحظة مختصرة]
خبير المشاعر (Emotional Resonance): [رقم]|[ملاحظة مختصرة]
خبير صوت العلامة (Brand Voice): [رقم]|[ملاحظة مختصرة]

WEAKNESSES:
- [نقطة ضعف 1]
- [نقطة ضعف 2]
- [نقطة ضعف 3]

IMPROVED:
[النص المحسّن هنا - لا تضع مقدمات أو تعليقات، قدّم النص مباشرة]`;

      const result = await model.generateContent(scoringPrompt);
      const response = result.response.text();

      // Parse scores
      const scoresSection = response.match(/SCORES:([\s\S]*?)WEAKNESSES:/)?.[1] || "";
      const weaknessSection = response.match(/WEAKNESSES:([\s\S]*?)IMPROVED:/)?.[1] || "";
      const improvedSection = response.match(/IMPROVED:([\s\S]*)/)?.[1]?.trim() || currentText;

      const panelScores: Record<string, { score: number; note: string }> = {};
      let weightedSum = 0;

      EXPERTS.forEach((expert) => {
        const shortName = expert.name.split(" (")[0];
        const lineRegex = new RegExp(`${expert.name.replace(/[()]/g, "\\$&")}:\\s*(\\d+)\\|(.+)`, "m");
        const match = scoresSection.match(lineRegex);
        const score = match ? parseInt(match[1]) : 70;
        const note = match ? match[2].trim() : "";
        panelScores[shortName] = { score, note };
        weightedSum += score * expert.weight;
      });

      const roundScore = Math.round(weightedSum / TOTAL_WEIGHT);
      finalScore = roundScore;

      allRounds.push({
        round: roundCount,
        score: roundScore,
        panelScores,
        weaknesses: weaknessSection.trim(),
        improvedText: improvedSection,
      });

      // Update text for next round
      currentText = improvedSection;

      // Stop if we hit the target
      if (roundScore >= TARGET_SCORE) break;
    }

    const bestRound = allRounds[allRounds.length - 1];

    // Save to database
    try {
      await prisma.expertPanelResult.create({
        data: {
          contentIdeaId: contentIdeaId || null,
          contentType,
          originalText: text,
          improvedText: bestRound.improvedText,
          finalScore: bestRound.score,
          rounds: roundCount,
          panelScores: bestRound.panelScores,
          topWeaknesses: allRounds[0]?.weaknesses || "",
        },
      });
    } catch (dbErr) {
      console.warn("Expert Panel DB save skipped:", dbErr);
    }

    return NextResponse.json({
      success: true,
      finalScore: bestRound.score,
      rounds: roundCount,
      originalText: text,
      improvedText: bestRound.improvedText,
      panelScores: bestRound.panelScores,
      topWeaknesses: allRounds[0]?.weaknesses || "",
      allRounds,
      passed: bestRound.score >= TARGET_SCORE,
    });

  } catch (err: any) {
    console.error("Expert Panel Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
