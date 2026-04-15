export const maxDuration = 60;
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Missing leadId" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    // 1. Calculate Rule-Based Pre-Score
    let baseScore = 0;
    if (lead.industry && (lead.industry.includes('تجميل') || lead.industry.includes('أسنان'))) baseScore += 20;
    if (lead.websiteUrl) {
      baseScore -= 10; 
    } else {
      baseScore += 40; // Needs a website badly! Huge selling point.
    }
    
    if (lead.rating && lead.rating >= 4.0) baseScore += 15;
    if (lead.reviewsCount && lead.reviewsCount > 50) baseScore += 15;
    if (lead.contactPhone) baseScore += 20;
    if (lead.status === 'CONTACTED') baseScore += 10;

    let priority = "Low";
    let scoreLabel = "COLD";

    if (baseScore >= 75) { priority = "High"; scoreLabel = "HOT"; }
    else if (baseScore >= 50) { priority = "Medium"; scoreLabel = "WARM"; }
    else { priority = "Low"; scoreLabel = "COLD"; }

    // 2. Query Gemini for Next-Best-Action
    const apiKey = process.env.GEMINI_API_KEY;
    let nextAction = "قم بمراجعة العميل يدوياً.";

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `أنت خبير مبيعات استراتيجي (Sales Closer) في وكالة تسويق وبناء مواقع رائدة.
المطلوب منك تحليل بيانات هذا العميل المحتمل وإعطائي جملة واحدة فقط وقصيرة كـ "الإجراء التالي الأمثل" (Next Best Action).
اجعل الجملة بصيغة أمر مباشر وقوي للموظف ليبدأ البيع، ومبنية على البيانات التي تراها (مثلاً إذا لم يكن لديه موقع، ركز على بيع موقع).

بيانات العميل:
- النشاط: ${lead.industry || 'عيادة/نشاط تجاري'}
- اسم المنشأة: ${lead.companyName}
- يمتلك موقع إلكتروني: ${lead.websiteUrl ? 'نعم' : 'لا (نقطة ضعف قوية لبيع موقع له)'}
- يمتلك رقم واتساب متاح: ${lead.contactPhone ? 'نعم' : 'لا'}
- نقاط العميل (درجة إغلاق الصفقة): ${baseScore}/100 (الأولوية: ${priority})
- مراجعات جوجل: ${lead.reviewsCount} مراجعة بتقييم ${lead.rating || 0}/5.

مثال للرد المقبول:
"اتصل به الآن واعرض عليه بناء موقع تعريفي ليواكب سمعته الجيدة في التقييمات."
أو 
"أرسل له رسالة عبر الواتساب بعرض تصميم باقة تسويقية."

الرد (جملة واحدة فقط بالعربية وبدون أي رموز إضافية):`;

      try {
        const result = await model.generateContent(prompt);
        nextAction = result.response.text().trim().replace(/["']/g, ''); // Fix formatting 
      } catch (geminiErr) {
        console.error("Gemini Analyze Error:", geminiErr);
        nextAction = baseScore >= 75 ? "تواصل معه فوراً (نقطة قوته أن ليس لديه موقع)." : "أرسل له رسالة مبدئية.";
      }
    } else {
        // Fallback Native Action
        nextAction = baseScore >= 75 ? "فرصة ممتازة! اتصل به الآن واعرض خدماتك." : "متابعة لاحقة. إمكانية الشراء متوسطة.";
    }

    const finalScore = baseScore > 100 ? 100 : baseScore;

    // 3. Update DB
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        score: finalScore,
        scoreLabel,
        priority,
        nextAction
      }
    });

    return NextResponse.json({ success: true, lead: updatedLead });

  } catch (error: any) {
    console.error("API AI Analyze Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
