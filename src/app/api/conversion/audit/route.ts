export const maxDuration = 60;
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Conversion Ops — CRO Audit
// Based on ai-marketing-skills/conversion-ops
export async function POST(req: Request) {
  try {
    const { url, industry = "general", pageContent } = await req.json();
    if (!url && !pageContent) return NextResponse.json({ success: false, error: "أدخل رابط الصفحة أو نصها" }, { status: 400 });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Fetch page content if URL provided
    let content = pageContent || "";
    if (url && !content) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "APEX-CRO-Auditor/1.0" }, signal: AbortSignal.timeout(10000) });
        content = await res.text();
        content = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").slice(0, 3000);
      } catch { content = `صفحة على الرابط: ${url}`; }
    }

    const prompt = `أنت خبير CRO (تحسين معدل التحويل). قيّم الصفحة التالية عبر 8 أبعاد وقدّم تقريراً احترافياً.

القطاع: ${industry}
${url ? `الرابط: ${url}` : ""}

محتوى الصفحة:
"""
${content.slice(0, 2000)}
"""

قيّم كل بُعد من 0-100 وأعطِ ملاحظة مختصرة وتوصية محددة:

DIM_1: وضوح العنوان الرئيسي|[رقم]|[ملاحظة]|[توصية]
DIM_2: ظهور وقوة زر الدعوة للعمل (CTA)|[رقم]|[ملاحظة]|[توصية]
DIM_3: الدليل الاجتماعي (شهادات، أرقام)|[رقم]|[ملاحظة]|[توصية]
DIM_4: الإلحاح والندرة|[رقم]|[ملاحظة]|[توصية]
DIM_5: إشارات الثقة والأمان|[رقم]|[ملاحظة]|[توصية]
DIM_6: بساطة النموذج وسهولته|[رقم]|[ملاحظة]|[توصية]
DIM_7: التوافق مع الجوال|[رقم]|[ملاحظة]|[توصية]
DIM_8: سرعة التحميل والأداء|[رقم]|[ملاحظة]|[توصية]

GRADE: [A+/A/B/C/D/F]
OVERALL: [رقم من 0-100]
SUMMARY: [ملخص تنفيذي 2-3 جمل]
TOP_FIXES:
FIX_1: [الإصلاح الأهم]|[التأثير المتوقع]|high
FIX_2: [الإصلاح الثاني]|[التأثير]|medium
FIX_3: [الإصلاح الثالث]|[التأثير]|medium`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const dims = [];
    for (let i = 1; i <= 8; i++) {
      const match = text.match(new RegExp(`DIM_${i}:\\s*([^|]+)\\|([\\d]+)\\|([^|]+)\\|([^\n]+)`));
      if (match) dims.push({ name: match[1].trim(), score: parseInt(match[2]), note: match[3].trim(), fix: match[4].trim() });
    }

    const grade = text.match(/GRADE:\s*([A+\-BCDFa-f+]+)/)?.[1] || "B";
    const overall = parseInt(text.match(/OVERALL:\s*(\d+)/)?.[1] || "70");
    const summary = text.match(/SUMMARY:\s*([^\n]+(?:\n(?!TOP_FIXES:)[^\n]+)*)/)?.[1]?.trim() || "";
    const fixes = [];
    for (let i = 1; i <= 3; i++) {
      const m = text.match(new RegExp(`FIX_${i}:\\s*([^|]+)\\|([^|]+)\\|([^\n]+)`));
      if (m) fixes.push({ fix: m[1].trim(), impact: m[2].trim(), priority: m[3].trim() });
    }

    return NextResponse.json({ success: true, dimensions: dims, grade, overall, summary, fixes, url });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
