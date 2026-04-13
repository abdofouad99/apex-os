import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// SEO Ops + YT Competitive Analysis
// Based on ai-marketing-skills/seo-ops & yt-competitive-analysis
export async function POST(req: Request) {
  try {
    const { type, competitors, niche, keywords, ytChannels } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // SEO Trend Scout
    if (type === "trends") {
      const prompt = `أنت خبير SEO وتحليل ترندات. قدّم تقريراً شاملاً عن اتجاهات السوق.

المجال: ${niche || "تسويق رقمي"}
المنافسون: ${competitors?.join(", ") || "لم يُحدد"}
الكلمات المفتاحية المعروفة: ${keywords?.join(", ") || "لم تُحدد"}

ابحث وحلّل:

TRENDING_KEYWORDS:
KW_1: [كلمة مفتاحية]|[حجم بحث تقديري]|[صعوبة 1-10]|[فرصة: high/medium/low]|[نوع: BOFU/MOFU/TOFU]
KW_2: [كلمة]|[حجم]|[صعوبة]|[فرصة]|[نوع]
KW_3: [كلمة]|[حجم]|[صعوبة]|[فرصة]|[نوع]
KW_4: [كلمة]|[حجم]|[صعوبة]|[فرصة]|[نوع]
KW_5: [كلمة]|[حجم]|[صعوبة]|[فرصة]|[نوع]
KW_6: [كلمة]|[حجم]|[صعوبة]|[فرصة]|[نوع]

COMPETITOR_GAPS:
GAP_1: [المنافس يرتب لـ]|[فرصة لك]|[الأولوية]
GAP_2: [المنافس يرتب لـ]|[فرصة]|[الأولوية]
GAP_3: [المنافس يرتب لـ]|[فرصة]|[الأولوية]

CONTENT_OPPORTUNITIES:
OPP_1: [موضوع مقترح]|[نوع المحتوى]|[الكلمة المستهدفة]|[تقدير حركة]
OPP_2: [موضوع]|[نوع]|[كلمة]|[حركة]
OPP_3: [موضوع]|[نوع]|[كلمة]|[حركة]
OPP_4: [موضوع]|[نوع]|[كلمة]|[حركة]

MARKET_TRENDS:
[تحليل 3-4 اتجاهات سوقية مهمة للربع القادم]

QUICK_WINS:
[3 إجراءات يمكن تنفيذها هذا الأسبوع للحصول على حركة سريعة]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const keywords_list = [];
      for (let i = 1; i <= 6; i++) {
        const m = text.match(new RegExp(`KW_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
        if (m) keywords_list.push({ keyword: m[1].trim(), volume: m[2].trim(), difficulty: m[3].trim(), opportunity: m[4].trim(), type: m[5].trim() });
      }
      const gaps = [];
      for (let i = 1; i <= 3; i++) {
        const m = text.match(new RegExp(`GAP_${i}:\\s*([^|]+)\\|([^|]+)\\|([^\n]+)`));
        if (m) gaps.push({ competitor: m[1].trim(), opportunity: m[2].trim(), priority: m[3].trim() });
      }
      const opportunities = [];
      for (let i = 1; i <= 4; i++) {
        const m = text.match(new RegExp(`OPP_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
        if (m) opportunities.push({ topic: m[1].trim(), type: m[2].trim(), keyword: m[3].trim(), traffic: m[4].trim() });
      }

      const marketTrends = text.match(/MARKET_TRENDS:\s*([\s\S]*?)(?=QUICK_WINS:|$)/)?.[1]?.trim() || "";
      const quickWins = text.match(/QUICK_WINS:\s*([\s\S]*)/)?.[1]?.trim() || "";

      return NextResponse.json({ success: true, type: "trends", keywords: keywords_list, gaps, opportunities, marketTrends, quickWins });
    }

    // YT Competitive Analysis
    if (type === "youtube") {
      const prompt = `أنت محلل YouTube متخصص في اكتشاف أنماط النجاح.

القنوات للتحليل: ${ytChannels?.join(", ") || "قنوات التسويق العربية"}
المجال: ${niche || "تسويق رقمي"}

قدّم تحليلاً شاملاً:

TOP_FORMATS:
FORMAT_1: [صيغة العنوان]|[سبب النجاح]|[مثال]|[مضاعف: Xx]
FORMAT_2: [صيغة]|[سبب]|[مثال]|[مضاعف]
FORMAT_3: [صيغة]|[سبب]|[مثال]|[مضاعف]
FORMAT_4: [صيغة]|[سبب]|[مثال]|[مضاعف]
FORMAT_5: [صيغة]|[سبب]|[مثال]|[مضاعف]

OUTLIER_PATTERNS:
[3-4 أنماط مشتركة بين الفيديوهات التي تحقق 2x أو أكثر من متوسط القناة]

THUMBNAIL_INSIGHTS:
[ما يجعل الصور المصغرة الفيرالية مختلفة]

CONTENT_GAPS:
GAP_1: [موضوع لم يغطَ بشكل كافٍ]|[الفرصة]
GAP_2: [موضوع]|[الفرصة]
GAP_3: [موضوع]|[الفرصة]

VIRAL_HOOKS:
HOOK_1: [خطاف مثبت]|[مثال تطبيقي]
HOOK_2: [خطاف]|[مثال]
HOOK_3: [خطاف]|[مثال]
HOOK_4: [خطاف]|[مثال]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const formats = [];
      for (let i = 1; i <= 5; i++) {
        const m = text.match(new RegExp(`FORMAT_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
        if (m) formats.push({ format: m[1].trim(), reason: m[2].trim(), example: m[3].trim(), multiplier: m[4].trim() });
      }
      const gapsYT = [];
      for (let i = 1; i <= 3; i++) {
        const m = text.match(new RegExp(`GAP_${i}:\\s*([^|]+)\\|([^\n]+)`));
        if (m) gapsYT.push({ topic: m[1].trim(), opportunity: m[2].trim() });
      }
      const hooks = [];
      for (let i = 1; i <= 4; i++) {
        const m = text.match(new RegExp(`HOOK_${i}:\\s*([^|]+)\\|([^\n]+)`));
        if (m) hooks.push({ hook: m[1].trim(), example: m[2].trim() });
      }
      const outliers = text.match(/OUTLIER_PATTERNS:\s*([\s\S]*?)(?=THUMBNAIL_INSIGHTS:|$)/)?.[1]?.trim() || "";
      const thumbnails = text.match(/THUMBNAIL_INSIGHTS:\s*([\s\S]*?)(?=CONTENT_GAPS:|$)/)?.[1]?.trim() || "";

      return NextResponse.json({ success: true, type: "youtube", formats, gaps: gapsYT, hooks, outlierPatterns: outliers, thumbnailInsights: thumbnails });
    }

    return NextResponse.json({ success: false, error: "نوع التحليل غير معروف" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
