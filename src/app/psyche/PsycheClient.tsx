"use client";

import { useState } from "react";
import {
  Brain, ShieldOff, DollarSign, UsersRound, Globe,
  Loader2, Send, Sparkles, ChevronRight
} from "lucide-react";

const TOOLS = [
  {
    id: "psychology",
    label: "علم نفس التسويق",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/20",
    desc: "50+ نموذج نفسي للإقناع وفهم سلوك المشتري",
    placeholder: "صف التحدي التسويقي... مثال: 'عملاؤنا يزورون صفحة التسعير لكن لا يشتركون. كيف نستخدم علم النفس لزيادة التحويل؟'"
  },
  {
    id: "churn",
    label: "منع الانسحاب",
    icon: ShieldOff,
    color: "from-red-500 to-rose-600",
    glow: "shadow-red-500/20",
    desc: "Cancel flows + عروض حفظ + Dunning + Health Score",
    placeholder: "صف حالة الـ Churn... مثال: 'معدل الإلغاء الشهري 8%، معظمهم يقولون إنه غالي. ليس لدينا cancel flow حالياً.'"
  },
  {
    id: "pricing",
    label: "استراتيجية التسعير",
    icon: DollarSign,
    color: "from-emerald-500 to-green-600",
    glow: "shadow-emerald-500/20",
    desc: "تحسين الباقات والأسعار بذكاء",
    placeholder: "صف منتجك والتسعير الحالي... مثال: 'أداة إدارة مشاريع SaaS، حالياً باقة واحدة بـ 29$/شهر. 500 عميل. هل نضيف باقات؟'"
  },
  {
    id: "research",
    label: "أبحاث العملاء",
    icon: UsersRound,
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    desc: "تحليل VOC + بناء Personas + استخراج الأنماط",
    placeholder: "صف ما تريد البحث عنه... مثال: 'نريد فهم لماذا العملاء في قطاع التعليم يتحولون لمنافسنا. لدينا 15 مكالمة مبيعات مسجلة.'"
  },
  {
    id: "community",
    label: "التسويق المجتمعي",
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
    desc: "بناء مجتمعات تسويقية وبرامج سفراء",
    placeholder: "صف منتجك والهدف المجتمعي... مثال: 'أداة تصميم B2C، 2000 مستخدم. نريد بناء مجتمع Discord لزيادة الاحتفاظ والتسويق الشفهي.'"
  }
];

export default function PsycheClient() {
  const [activeTool, setActiveTool] = useState("psychology");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const current = TOOLS.find(t => t.id === activeTool)!;

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/psyche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: activeTool, input })
      });
      const data = await res.json();
      setResult(data.result || data.error || "خطأ غير متوقع");
    } catch {
      setResult("فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-[1400px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-purple-950/40 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              PSYCHE Engine <span className="text-violet-400">🧠</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              محرك النفسيات والاحتفاظ — 5 أدوات ذكية لفهم العملاء وإقناعهم والاحتفاظ بهم
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-5 gap-3 mt-6">
          {[
            { label: "نموذج نفسي", value: "50+" },
            { label: "إطار للتسعير", value: "12" },
            { label: "إشارة خطر", value: "8" },
            { label: "نوع بحث", value: "6" },
            { label: "playbook مجتمعي", value: "4" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-lg font-black text-violet-400">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => { setActiveTool(tool.id); setResult(""); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all duration-300 ${
                active
                  ? `bg-gradient-to-r ${tool.color} text-white border-transparent shadow-lg ${tool.glow}`
                  : "bg-slate-900/50 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${current.color}`}>
              <current.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{current.label}</h3>
              <p className="text-[11px] text-slate-500">{current.desc}</p>
            </div>
          </div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={current.placeholder}
            rows={8}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 resize-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
              loading || !input.trim()
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : `bg-gradient-to-r ${current.color} text-white shadow-lg hover:shadow-xl hover:scale-[1.01]`
            }`}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> جاري التحليل بالذكاء الاصطناعي...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> تحليل ذكي <Send className="h-3 w-3" /></>
            )}
          </button>

          {/* Quick prompts */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">أمثلة سريعة</div>
            {getQuickPrompts(activeTool).map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="flex items-center gap-2 w-full text-right text-[11px] text-slate-500 hover:text-violet-400 rounded-lg px-3 py-1.5 hover:bg-white/[0.03] transition-colors"
              >
                <ChevronRight className="h-3 w-3 shrink-0 rotate-180" />
                <span className="truncate">{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Output Panel */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">نتائج التحليل</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-violet-500/20 animate-pulse" />
                <Brain className="h-7 w-7 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <p className="text-xs text-slate-500">PSYCHE يحلل البيانات...</p>
            </div>
          ) : result ? (
            <div className="prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[600px] scrollbar-thin text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
              {result}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Brain className="h-12 w-12 text-slate-700" />
              <p className="text-sm text-slate-600">اختر أداة وأدخل بياناتك لبدء التحليل</p>
              <p className="text-[11px] text-slate-700">محرك PSYCHE يعمل بقوة Gemini AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getQuickPrompts(tool: string): string[] {
  const prompts: Record<string, string[]> = {
    psychology: [
      "كيف أستخدم Loss Aversion في صفحة التسعير لزيادة التحويل؟",
      "ما أفضل نماذج الإقناع لصفحة هبوط SaaS B2B؟",
      "كيف أطبق Anchoring + Decoy Effect في باقاتي الثلاثة؟",
    ],
    churn: [
      "معدل إلغاء 8% شهرياً لتطبيق إدارة مشاريع. كيف أبني cancel flow فعّال؟",
      "كيف أصمم نظام Health Score لاكتشاف العملاء المعرضين للإلغاء مبكراً؟",
      "أحتاج استراتيجية Dunning كاملة لاسترداد الدفعات الفاشلة عبر Stripe.",
    ],
    pricing: [
      "أداة SaaS بسعر واحد 29$/شهر. كيف أصمم 3 باقات Good-Better-Best؟",
      "متى يجب أن أرفع الأسعار وكيف أتعامل مع العملاء الحاليين؟",
      "كيف أختار Value Metric المناسب: per seat vs. per usage vs. flat fee؟",
    ],
    research: [
      "أريد تحليل مراجعات المنافسين على G2 لاستخراج نقاط الألم والفرص.",
      "كيف أبني Persona دقيقة من 10 مقابلات عملاء لأداة HR SaaS؟",
      "أحتاج خطة بحث كاملة لفهم لماذا 30% من المستخدمين لا يكملون الـ onboarding.",
    ],
    community: [
      "أريد إطلاق مجتمع Discord من الصفر لأداة تصميم. كيف أبدأ؟",
      "كيف أصمم برنامج سفراء لتحويل أفضل عملائنا لمسوّقين؟",
      "مجتمعنا 500 عضو لكن 10 فقط نشطين. كيف أحل المشكلة؟",
    ],
  };
  return prompts[tool] || [];
}
