import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// APEX Studio — Multi-tool API
// Covers: sales-playbook, finance-ops, deck-generator, podcast-ops, team-ops, x-longform-post
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool } = body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let prompt = "";
    let parseResult: (text: string) => any = (t) => ({ raw: t });

    switch (tool) {
      // ── SALES PLAYBOOK ──────────────────────────────────────────
      case "sales-playbook": {
        const { service, targetClient, currentPrice, competitors } = body;
        prompt = `أنت خبير استراتيجية مبيعات متخصص في التسعير القائم على القيمة.

الخدمة: ${service}
العميل المستهدف: ${targetClient}
السعر الحالي: ${currentPrice || "غير محدد"}
المنافسون: ${competitors || "غير محدد"}

أنشئ Sales Playbook احترافياً:

VALUE_PROPOSITION:
[عرض القيمة الفريد في جملة واحدة قوية]

PRICING_TIERS:
TIER_1: [اسم الباقة]|[السعر]|[ما تشمله]|[للعميل]
TIER_2: [اسم]|[السعر]|[ما تشمله]|[للعميل]
TIER_3: [اسم]|[السعر]|[ما تشمله]|[للعميل]

OBJECTION_HANDLERS:
OBJ_1: [الاعتراض]|[الرد المثالي]
OBJ_2: [الاعتراض]|[الرد]
OBJ_3: [الاعتراض]|[الرد]
OBJ_4: [الاعتراض]|[الرد]

DISCOVERY_QUESTIONS:
Q_1: [سؤال كشف يكشف الألم]
Q_2: [سؤال]
Q_3: [سؤال]
Q_4: [سؤال]
Q_5: [سؤال]

CLOSING_SCRIPTS:
CLOSE_1: [أسلوب إغلاق]|[النص الكامل]
CLOSE_2: [أسلوب]|[النص]`;

        parseResult = (text) => {
          const getTiers = () => {
            const tiers = [];
            for (let i = 1; i <= 3; i++) {
              const m = text.match(new RegExp(`TIER_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
              if (m) tiers.push({ name: m[1].trim(), price: m[2].trim(), includes: m[3].trim(), target: m[4].trim() });
            }
            return tiers;
          };
          const getObjs = () => {
            const objs = [];
            for (let i = 1; i <= 4; i++) {
              const m = text.match(new RegExp(`OBJ_${i}:\\s*([^|]+)\\|([^\n]+)`));
              if (m) objs.push({ objection: m[1].trim(), response: m[2].trim() });
            }
            return objs;
          };
          const getQs = () => text.match(/Q_\d+:\s*([^\n]+)/g)?.map(l => l.replace(/Q_\d+:\s*/, "").trim()) || [];
          const getCloses = () => {
            const closes = [];
            for (let i = 1; i <= 2; i++) {
              const m = text.match(new RegExp(`CLOSE_${i}:\\s*([^|]+)\\|([^\n]+)`));
              if (m) closes.push({ style: m[1].trim(), script: m[2].trim() });
            }
            return closes;
          };
          return {
            valueProp: text.match(/VALUE_PROPOSITION:\s*([\s\S]*?)(?=PRICING_TIERS:|$)/)?.[1]?.trim(),
            tiers: getTiers(), objections: getObjs(), questions: getQs(), closes: getCloses()
          };
        };
        break;
      }

      // ── FINANCE OPS ──────────────────────────────────────────────
      case "finance-ops": {
        const { adSpend, leads, conversions, revenue, period } = body;
        prompt = `أنت محلل مالي متخصص في ROI التسويقي. حلّل الأرقام التالية وقدّم تقريراً اقتصادياً شاملاً.

الفترة: ${period || "الشهر الحالي"}
الإنفاق الإعلاني: ${adSpend || "غير محدد"} ريال
عدد الـ Leads: ${leads || "غير محدد"}
التحويلات (مبيعات): ${conversions || "غير محدد"}
الإيرادات: ${revenue || "غير محدد"} ريال

احسب وحلّل:

METRICS:
METRIC_1: ROI الكلي|[الحساب]|[القيمة]|[التقييم: excellent/good/poor]
METRIC_2: تكلفة اكتساب العميل (CAC)|[الحساب]|[القيمة]|[التقييم]
METRIC_3: تكلفة الـ Lead|[الحساب]|[القيمة]|[التقييم]
METRIC_4: معدل تحويل Leads|[الحساب]|[القيمة]|[التقييم]
METRIC_5: العائد على كل ريال إعلان (ROAS)|[الحساب]|[القيمة]|[التقييم]

ANALYSIS:
[تحليل عميق 3-4 جمل لصحة الأرقام]

BENCHMARKS:
[مقارنة بمتوسطات الصناعة للقطاع]

RECOMMENDATIONS:
REC_1: [توصية مالية]|[التأثير المتوقع]|high
REC_2: [توصية]|[التأثير]|medium
REC_3: [توصية]|[التأثير]|medium

FORECAST:
[توقع الشهر القادم بناءً على الأرقام الحالية]`;

        parseResult = (text) => {
          const metrics = [];
          for (let i = 1; i <= 5; i++) {
            const m = text.match(new RegExp(`METRIC_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
            if (m) metrics.push({ name: m[1].trim(), formula: m[2].trim(), value: m[3].trim(), rating: m[4].trim() });
          }
          const recs = [];
          for (let i = 1; i <= 3; i++) {
            const m = text.match(new RegExp(`REC_${i}:\\s*([^|]+)\\|([^|]+)\\|([^\n]+)`));
            if (m) recs.push({ rec: m[1].trim(), impact: m[2].trim(), priority: m[3].trim() });
          }
          return {
            metrics,
            analysis: text.match(/ANALYSIS:\s*([\s\S]*?)(?=BENCHMARKS:|$)/)?.[1]?.trim(),
            benchmarks: text.match(/BENCHMARKS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/)?.[1]?.trim(),
            recommendations: recs,
            forecast: text.match(/FORECAST:\s*([\s\S]*)/)?.[1]?.trim(),
          };
        };
        break;
      }

      // ── X LONGFORM POST ──────────────────────────────────────────
      case "x-post": {
        const { topic, expertise, angle, tweetCount = 12 } = body;
        prompt = `أنت خبير كتابة خيوط X/Twitter (Twitter Threads) باللغة العربية.

الموضوع: ${topic}
زاوية الطرح: ${angle || "تعليمية مثيرة"}
الخبرة: ${expertise || "تسويق رقمي"}
عدد التغريدات: ${tweetCount}

اكتب خيطاً X احترافياً بالعربية يُقرأ حتى النهاية:

قواعد مهمة:
1. التغريدة الأولى = hook قوي جداً (سؤال، إحصاء مثير، أو وعد واضح)
2. كل تغريدة ≤ 280 حرفاً
3. استخدم أرقاماً وقوائم لسهولة القراءة
4. الأخيرة = CTA + طلب Retweet/Follow
5. الثانية دائماً: "دعني أشرح لك 🧵"

FORMAT:
TWEET_1: [نص التغريدة]
TWEET_2: [نص]
...حتى TWEET_${tweetCount}

HOOK_SCORE: [رقم من 1-10]
ESTIMATED_ENGAGEMENT: [تقدير التفاعل المتوقع: low/medium/high/viral]`;

        parseResult = (text) => {
          const tweets = [];
          for (let i = 1; i <= tweetCount; i++) {
            const m = text.match(new RegExp(`TWEET_${i}:\\s*([\\s\\S]*?)(?=TWEET_${i + 1}:|HOOK_SCORE:|$)`));
            if (m) tweets.push(m[1].trim());
          }
          return {
            tweets,
            hookScore: parseInt(text.match(/HOOK_SCORE:\s*(\d+)/)?.[1] || "7"),
            engagement: text.match(/ESTIMATED_ENGAGEMENT:\s*(\w+)/)?.[1] || "medium",
          };
        };
        break;
      }

      // ── PODCAST OPS ──────────────────────────────────────────────
      case "podcast": {
        const { transcript, podcastName, guestName } = body;
        prompt = `أنت خبير تحويل البودكاست إلى محتوى متعدد المنصات.

اسم البودكاست: ${podcastName || "بودكاست APEX"}
الضيف: ${guestName || ""}
النص أو الملخص:
"""${transcript?.slice(0, 2000) || "قدّم محتوى تجريبياً لبودكاست تسويقي"}"""

حوّل المحتوى إلى:

SUMMARY:
[ملخص تنفيذي 3 جمل للحلقة]

KEY_QUOTES:
QUOTE_1: [اقتباس قوي]
QUOTE_2: [اقتباس]
QUOTE_3: [اقتباس]

LINKEDIN_POST:
[منشور LinkedIn احترافي كامل 150-200 كلمة]

INSTAGRAM_CAPTION:
[كابشن Instagram جذاب مع هاشتاقات]

X_THREAD_HOOK:
[أول تغريدة خيط X تُغري بالقراءة]

BLOG_OUTLINE:
[مخطط مقال بلوق من الحلقة: المقدمة + 4-5 نقاط رئيسية + خاتمة]

NEWSLETTER_SECTION:
[قسم نشرة بريدية 100 كلمة عن الحلقة]`;

        parseResult = (text) => ({
          summary: text.match(/SUMMARY:\s*([\s\S]*?)(?=KEY_QUOTES:|$)/)?.[1]?.trim(),
          quotes: text.match(/QUOTE_\d+:\s*([^\n]+)/g)?.map(l => l.replace(/QUOTE_\d+:\s*/, "").trim()) || [],
          linkedin: text.match(/LINKEDIN_POST:\s*([\s\S]*?)(?=INSTAGRAM_CAPTION:|$)/)?.[1]?.trim(),
          instagram: text.match(/INSTAGRAM_CAPTION:\s*([\s\S]*?)(?=X_THREAD_HOOK:|$)/)?.[1]?.trim(),
          xHook: text.match(/X_THREAD_HOOK:\s*([\s\S]*?)(?=BLOG_OUTLINE:|$)/)?.[1]?.trim(),
          blogOutline: text.match(/BLOG_OUTLINE:\s*([\s\S]*?)(?=NEWSLETTER_SECTION:|$)/)?.[1]?.trim(),
          newsletter: text.match(/NEWSLETTER_SECTION:\s*([\s\S]*)/)?.[1]?.trim(),
        });
        break;
      }

      // ── TEAM OPS ─────────────────────────────────────────────────
      case "team-ops": {
        const { meetingNotes, teamSize, period } = body;
        prompt = `أنت خبير إدارة فرق التسويق. حلّل نتائج الفريق وقدّم تقريراً شاملاً.

الفريق: ${teamSize || "5"} أشخاص
الفترة: ${period || "هذا الأسبوع"}
ملاحظات الاجتماع/الأداء:
"""${meetingNotes || "قدّم تقييماً تجريبياً لفريق تسويق في وكالة رقمية"}"""

قدّم:

DECISIONS:
DEC_1: [قرار اتُّخذ]|[المسؤول]|[الموعد النهائي]
DEC_2: [قرار]|[المسؤول]|[الموعد]
DEC_3: [قرار]|[المسؤول]|[الموعد]

ACTION_ITEMS:
ACTION_1: [مهمة محددة]|[المسؤول]|[الموعد]|[الأولوية]
ACTION_2: [مهمة]|[مسؤول]|[موعد]|[أولوية]
ACTION_3: [مهمة]|[مسؤول]|[موعد]|[أولوية]
ACTION_4: [مهمة]|[مسؤول]|[موعد]|[أولوية]

PERFORMANCE_SUMMARY:
[ملخص أداء الفريق هذه الفترة - نقاط قوة وتحسين]

BLOCKERS:
[العوائق الرئيسية وكيفية حلها]

NEXT_WEEK_FOCUS:
[3 أولويات للأسبوع القادم]`;

        parseResult = (text) => {
          const decisions = [];
          for (let i = 1; i <= 3; i++) {
            const m = text.match(new RegExp(`DEC_${i}:\\s*([^|]+)\\|([^|]+)\\|([^\n]+)`));
            if (m) decisions.push({ decision: m[1].trim(), owner: m[2].trim(), deadline: m[3].trim() });
          }
          const actions = [];
          for (let i = 1; i <= 4; i++) {
            const m = text.match(new RegExp(`ACTION_${i}:\\s*([^|]+)\\|([^|]+)\\|([^|]+)\\|([^\n]+)`));
            if (m) actions.push({ task: m[1].trim(), owner: m[2].trim(), deadline: m[3].trim(), priority: m[4].trim() });
          }
          return {
            decisions,
            actions,
            performance: text.match(/PERFORMANCE_SUMMARY:\s*([\s\S]*?)(?=BLOCKERS:|$)/)?.[1]?.trim(),
            blockers: text.match(/BLOCKERS:\s*([\s\S]*?)(?=NEXT_WEEK_FOCUS:|$)/)?.[1]?.trim(),
            nextWeek: text.match(/NEXT_WEEK_FOCUS:\s*([\s\S]*)/)?.[1]?.trim(),
          };
        };
        break;
      }

      default:
        return NextResponse.json({ success: false, error: "أداة غير معروفة" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseResult(text);

    return NextResponse.json({ success: true, tool, result: parsed, raw: text });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
