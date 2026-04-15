export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { callGeminiWithFallback } from "@/lib/gemini-rotator";

export async function POST(req: Request) {
  try {
    const { competitorId } = await req.json();

    if (!competitorId) {
      return NextResponse.json({ success: false, error: "Missing competitorId" }, { status: 400 });
    }

    const competitor = await prisma.competitor.findUnique({
      where: { id: competitorId },
      include: { ads: true }
    });

    if (!competitor) {
      return NextResponse.json({ success: false, error: "Competitor not found" }, { status: 404 });
    }

    // 1. Performance Metrics (Simulated for MVP)
    const websiteSpeed = Math.random() > 0.5 ? 'سريع (85/100)' : 'بطيء (42/100)';
    const seoScore = Math.floor(Math.random() * 40) + 40;
    
    const adDataText = competitor.ads.map(a => `- قوة الخطاف: ${a.hookScore}/10 | النص: ${a.bodyText?.slice(0, 80)}...`).join('\n');

    // 2. AI Marketing Analysis via Gemini Rotator (with Groq + Ollama fallback)
    const prompt = `أنت محلل تسويقي محترف في وكالة تسويق رقمية تسمى APEX.
مهمتك هي تحليل إعلانات المنافس وتقديم تقرير تسويقي احترافي لمساعدة عميلنا على التفوق.

اسم المنافس: ${competitor.name}
عدد الإعلانات المكتشفة: ${competitor.activeAdsCount || competitor.ads.length}
بيانات إعلاناته:
${adDataText || "لا يوجد نص واضح للإعلانات - يعتمد غالباً على الصور/الفيديو فقط"}

حلل هذا المنافس وأجب بالتنسيق التالي بدقة:

STRENGTHS:
- (نقطة قوة 1 لدى المنافس)
- (نقطة قوة 2)

WEAKNESSES:
- (نقطة ضعف تسويقية 1)
- (نقطة ضعف 2)
- (نقطة ضعف 3)

STRATEGY:
(استراتيجية تسويقية مفصلة للتفوق على هذا المنافس - 3 إلى 5 خطوات عملية)

KEYWORDS:
(أهم 5-8 كلمات مفتاحية يستخدمها المنافس، مفصولة بفواصل)
`;

    const result = await callGeminiWithFallback({
      model: "gemini-2.0-flash",
      systemPrompt: "أنت محلل تسويقي خبير. أجب بالعربية فقط وبالتنسيق المطلوب بدقة.",
      userPrompt: prompt,
      temperature: 0.7,
      maxOutputTokens: 4096
    });

    if (!result.success) {
      console.error("Deep Scan AI Error:", result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 503 });
    }

    const responseText = result.text || "";

    const strengthsMatch = responseText.match(/STRENGTHS:([\s\S]*?)WEAKNESSES:/);
    const weaknessMatch = responseText.match(/WEAKNESSES:([\s\S]*?)STRATEGY:/);
    const strategyMatch = responseText.match(/STRATEGY:([\s\S]*?)KEYWORDS:/);
    const keywordsMatch = responseText.match(/KEYWORDS:([\s\S]*)/);

    const strengths = strengthsMatch ? strengthsMatch[1].trim() : "يمتلك حضوراً إعلانياً نشطاً.";
    const weaknesses = weaknessMatch ? weaknessMatch[1].trim() : "ضعف في صياغة العروض المباشرة.";
    const strategy = strategyMatch ? strategyMatch[1].trim() : "اصنع عرضاً أقوى وقم بتوزيعه عبر منصات الفيديو.";
    const topKeywords = keywordsMatch ? keywordsMatch[1].trim() : "تسويق, إعلانات, عروض, خصم";

    // 3. Save The Report to Database
    const report = await prisma.ghostReport.create({
      data: {
        websiteSpeed,
        seoScore,
        topKeywords,
        vulnerabilities: `💪 نقاط القوة:\n${strengths}\n\n⚠️ نقاط الضعف:\n${weaknesses}`,
        attackPlan: strategy,
        competitorId: competitor.id
      }
    });

    return NextResponse.json({ success: true, report });

  } catch (err: any) {
    console.error("Deep Scan API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
