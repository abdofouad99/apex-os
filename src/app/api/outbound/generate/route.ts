export const maxDuration = 60;
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

// ============================================================
// STRIKER Engine — AI Outbound Campaign Generator
// Based on ai-marketing-skills/outbound-engine
// ============================================================

export async function POST(req: Request) {
  try {
    const { targetIndustry, targetPain, offerValue, senderName, senderCompany, tone = "احترافي", count = 3 } = await req.json();

    if (!targetIndustry || !targetPain || !offerValue) {
      return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "GEMINI_API_KEY missing" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `أنت خبير Outbound Marketing متخصص في كتابة رسائل Cold Email عربية عالية التحويل.

اكتب ${count} رسائل بريد إلكتروني Cold Email مختلفة في أسلوبها بالعربية للبيانات التالية:

- القطاع المستهدف: ${targetIndustry}
- نقطة الألم الرئيسية: ${targetPain}
- قيمة العرض: ${offerValue}
- اسم المُرسِل: ${senderName || "مدير التسويق"}
- شركة المُرسِل: ${senderCompany || "شركتنا"}
- الأسلوب: ${tone}

قواعد مهمة:
1. كل رسالة لا تتجاوز 120 كلمة
2. السطر الأول هو الخطاف (Hook) — يجب أن يصدم أو يثير فضول
3. لا تبدأ بـ "آمل أن..." أو "أكتب إليك لـ"
4. أضف CTA واحد واضح في النهاية
5. كل رسالة بأسلوب مختلف: مباشر، قصة، سؤال، إحصاء

أجب بالتنسيق الدقيق التالي (لا تضف أي نصوص خارج هذا الهيكل):

EMAIL_1:
SUBJECT: [سطر موضوع مثير ≤8 كلمات]
BODY: [نص الرسالة]
HOOK_SCORE: [رقم من 1-10]
STYLE: [نوع الأسلوب]
---
EMAIL_2:
SUBJECT: [سطر موضوع]
BODY: [نص الرسالة]
HOOK_SCORE: [رقم]
STYLE: [نوع الأسلوب]
---
EMAIL_3:
SUBJECT: [سطر موضوع]
BODY: [نص الرسالة]
HOOK_SCORE: [رقم]
STYLE: [نوع الأسلوب]
---`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse emails
    const emails: any[] = [];
    const emailBlocks = text.split("---").filter(b => b.includes("EMAIL_"));

    emailBlocks.forEach((block, i) => {
      const subjectMatch = block.match(/SUBJECT:\s*(.+)/);
      const bodyMatch = block.match(/BODY:\s*([\s\S]+?)(?=HOOK_SCORE:|$)/);
      const hookMatch = block.match(/HOOK_SCORE:\s*(\d+)/);
      const styleMatch = block.match(/STYLE:\s*(.+)/);

      if (subjectMatch && bodyMatch) {
        emails.push({
          id: i + 1,
          subject: subjectMatch[1].trim(),
          body: bodyMatch[1].trim(),
          hookScore: hookMatch ? parseInt(hookMatch[1]) : 7,
          style: styleMatch ? styleMatch[1].trim() : "احترافي",
        });
      }
    });

    return NextResponse.json({ success: true, emails, count: emails.length });

  } catch (err: any) {
    console.error("STRIKER API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
