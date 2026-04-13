import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Revenue Intelligence — Client Report Generator
// Based on ai-marketing-skills/revenue-intelligence
export async function POST(req: Request) {
  try {
    const { clientName, metrics, period, industry } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `أنت محلل إيرادات احترافي. أنشئ تقرير ذكاء إيرادات شاملاً للعميل.

العميل: ${clientName || "عميل APEX"}
القطاع: ${industry || "تسويق رقمي"}
الفترة: ${period || "الشهر الحالي"}
البيانات: ${JSON.stringify(metrics || {})}

أنشئ تقريراً شاملاً بالعربية يحتوي على:

SECTION: ملخص تنفيذي
[3 جمل تلخص أهم نتائج الشهر]

SECTION: أبرز مؤشرات الأداء
KPI_1: [اسم المؤشر]|[القيمة]|[التغيير %]|[التقييم: up/down/neutral]
KPI_2: [اسم المؤشر]|[القيمة]|[التغيير %]|[التقييم]
KPI_3: [اسم المؤشر]|[القيمة]|[التغيير %]|[التقييم]
KPI_4: [اسم المؤشر]|[القيمة]|[التغيير %]|[التقييم]
KPI_5: [اسم المؤشر]|[القيمة]|[التغيير %]|[التقييم]

SECTION: تحليل المبيعات
[تحليل تفصيلي لأداء المبيعات]

SECTION: إشارات الشراء الرئيسية
SIGNAL_1: [إشارة]|[التوصية]
SIGNAL_2: [إشارة]|[التوصية]
SIGNAL_3: [إشارة]|[التوصية]

SECTION: اكتشاف الثغرات في قمع المبيعات
[اكتشاف نقاط الضعف في رحلة العميل]

SECTION: خطة الإجراءات (الأسبوع القادم)
ACTION_1: [الإجراء]|[الأولوية: high/medium/low]|[المسؤول]
ACTION_2: [الإجراء]|[الأولوية]|[المسؤول]
ACTION_3: [الإجراء]|[الأولوية]|[المسؤول]
ACTION_4: [الإجراء]|[الأولوية]|[المسؤول]

SECTION: توقعات الشهر القادم
[توقعات مبنية على البيانات الحالية]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse sections
    const getSection = (name: string) => {
      const regex = new RegExp(`SECTION: ${name}\\n([\\s\\S]*?)(?=SECTION:|$)`);
      return text.match(regex)?.[1]?.trim() || "";
    };

    const parseKPIs = () => {
      const section = getSection("أبرز مؤشرات الأداء");
      return section.split("\n").filter(l => l.startsWith("KPI_")).map(l => {
        const parts = l.replace(/KPI_\d+:\s*/, "").split("|");
        return { name: parts[0]?.trim(), value: parts[1]?.trim(), change: parts[2]?.trim(), trend: parts[3]?.trim() };
      });
    };

    const parseSignals = () => {
      const section = getSection("إشارات الشراء الرئيسية");
      return section.split("\n").filter(l => l.startsWith("SIGNAL_")).map(l => {
        const parts = l.replace(/SIGNAL_\d+:\s*/, "").split("|");
        return { signal: parts[0]?.trim(), recommendation: parts[1]?.trim() };
      });
    };

    const parseActions = () => {
      const section = getSection("خطة الإجراءات (الأسبوع القادم)");
      return section.split("\n").filter(l => l.startsWith("ACTION_")).map(l => {
        const parts = l.replace(/ACTION_\d+:\s*/, "").split("|");
        return { action: parts[0]?.trim(), priority: parts[1]?.trim(), owner: parts[2]?.trim() };
      });
    };

    return NextResponse.json({
      success: true,
      report: {
        summary: getSection("ملخص تنفيذي"),
        kpis: parseKPIs(),
        salesAnalysis: getSection("تحليل المبيعات"),
        signals: parseSignals(),
        funnelGaps: getSection("اكتشاف الثغرات في قمع المبيعات"),
        actions: parseActions(),
        forecast: getSection("توقعات الشهر القادم"),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
