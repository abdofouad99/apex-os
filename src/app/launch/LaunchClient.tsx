"use client";

import { useState } from "react";
import {
  Rocket, Share2, Megaphone, Magnet, Lightbulb,
  Loader2, Send, Sparkles, ChevronRight
} from "lucide-react";

const TOOLS = [
  {
    id: "launch",
    label: "استراتيجية الإطلاق",
    icon: Rocket,
    color: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/20",
    desc: "إطلاق منتجات في 5 مراحل + Product Hunt + ORB Framework",
    placeholder: "صف ما تريد إطلاقه... مثال: 'نطلق أداة SaaS لإدارة المشاريع. لدينا 200 مشترك في القائمة البريدية و500 متابع على Twitter. الإطلاق بعد 3 أسابيع.'"
  },
  {
    id: "referral",
    label: "برامج الإحالة",
    icon: Share2,
    color: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/20",
    desc: "تصميم برامج إحالة وأفلييت تحول العملاء لمسوّقين",
    placeholder: "صف منتجك... مثال: 'تطبيق SaaS بـ 1000 عميل. LTV: $500. CAC: $80. نريد تصميم برنامج إحالة double-sided لتقليل CAC.'"
  },
  {
    id: "adcreative",
    label: "إعلانات إبداعية",
    icon: Megaphone,
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    desc: "توليد إعلانات Google/Meta/LinkedIn/TikTok على نطاق واسع",
    placeholder: "صف المنتج والمنصة... مثال: 'أداة أتمتة تسويق، Google RSA. القيمة: توفير 10 ساعات أسبوعياً في التقارير. الجمهور: مدراء تسويق SaaS.'"
  },
  {
    id: "leadmagnet",
    label: "Lead Magnets",
    icon: Magnet,
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
    desc: "تصميم عروض جذب العملاء المحتملين واستراتيجيات الـ Gating",
    placeholder: "صف منتجك وهدفك... مثال: 'أداة HR SaaS. نريد تصميم lead magnet لمدراء الموارد البشرية. الهدف: بناء قائمة 5000 بريد في 3 أشهر.'"
  },
  {
    id: "ideas",
    label: "أفكار تسويقية",
    icon: Lightbulb,
    color: "from-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    desc: "140+ فكرة تسويقية SaaS مخصصة لموقفك",
    placeholder: "صف منتجك وميزانيتك... مثال: 'أداة تحليلات بيانات SaaS، فريق من 3 أشخاص. ميزانية تسويق $2000/شهر. بدأنا قبل 6 أشهر. 50 عميلاً.'"
  }
];

export default function LaunchClient() {
  const [activeTool, setActiveTool] = useState("launch");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const current = TOOLS.find(t => t.id === activeTool)!;

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/launch", {
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
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/40 via-slate-900/60 to-red-950/40 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.08),transparent_60%)]" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
            <Rocket className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              LAUNCH Engine <span className="text-orange-400">🚀</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              محرك الإطلاق والنمو — 5 أدوات ذكية لإطلاق المنتجات وتوليد العملاء وتسريع النمو
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-5 gap-3 mt-6">
          {[
            { label: "مرحلة إطلاق", value: "5" },
            { label: "فكرة تسويقية", value: "140+" },
            { label: "منصة إعلانية", value: "5" },
            { label: "نوع Lead Magnet", value: "10" },
            { label: "هيكل إحالة", value: "3" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="text-lg font-black text-orange-400">{s.value}</div>
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
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/30 resize-none"
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
              <><Loader2 className="h-4 w-4 animate-spin" /> جاري التوليد بالذكاء الاصطناعي...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> توليد ذكي <Send className="h-3 w-3" /></>
            )}
          </button>

          {/* Quick prompts */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">أمثلة سريعة</div>
            {getQuickPrompts(activeTool).map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="flex items-center gap-2 w-full text-right text-[11px] text-slate-500 hover:text-orange-400 rounded-lg px-3 py-1.5 hover:bg-white/[0.03] transition-colors"
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
            <Sparkles className="h-4 w-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">نتائج التوليد</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-orange-500/20 animate-pulse" />
                <Rocket className="h-7 w-7 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
              </div>
              <p className="text-xs text-slate-500">LAUNCH يجهّز الخطة...</p>
            </div>
          ) : result ? (
            <div className="prose prose-invert prose-sm max-w-none overflow-y-auto max-h-[600px] scrollbar-thin text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
              {result}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Rocket className="h-12 w-12 text-slate-700" />
              <p className="text-sm text-slate-600">اختر أداة وأدخل بياناتك لبدء التوليد</p>
              <p className="text-[11px] text-slate-700">محرك LAUNCH يعمل بقوة Gemini AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getQuickPrompts(tool: string): string[] {
  const prompts: Record<string, string[]> = {
    launch: [
      "نطلق ميزة جديدة كبيرة. كيف أصمم خطة إطلاق من 5 مراحل؟",
      "نريد إطلاق على Product Hunt. ما أفضل استراتيجية للوصول لـ #1 Product of the Day؟",
      "كيف أستخدم إطار ORB (Owned-Rented-Borrowed) لإطلاق تطبيق جديد؟",
    ],
    referral: [
      "كيف أصمم برنامج إحالة double-sided لأداة SaaS بـ LTV $500؟",
      "ما أفضل لحظات تفعيل الإحالة داخل التطبيق؟",
      "كيف أبني برنامج أفلييت مع عمولة مستمرة للمؤثرين؟",
    ],
    adcreative: [
      "أحتاج 15 headline لـ Google RSA لأداة أتمتة تسويق. القيمة: توفير 10 ساعات/أسبوع.",
      "ولّد 5 إعلانات Meta Ads لأداة إدارة مشاريع مع 3 زوايا مختلفة.",
      "أحتاج إعلانات LinkedIn لاستهداف مدراء IT في شركات 500+ موظف.",
    ],
    leadmagnet: [
      "ما أفضل lead magnet لأداة HR SaaS تستهدف مدراء الموارد البشرية؟",
      "كيف أصمم quiz كـ lead magnet لتقسيم الجمهور وزيادة التحويل؟",
      "أريد استراتيجية content upgrade لمدونة تحصل على 10K زيارة/شهر.",
    ],
    ideas: [
      "أداة SaaS جديدة، فريق من 3، ميزانية $2000/شهر. ما أفضل 10 أفكار تسويقية؟",
      "نريد أفكار Growth Engineering مجانية لمضاعفة الترافيك في 6 أشهر.",
      "ما أفكار التسويق المجاني الأعلى ROI لستارتب B2B SaaS في مرحلة البداية؟",
    ],
  };
  return prompts[tool] || [];
}
