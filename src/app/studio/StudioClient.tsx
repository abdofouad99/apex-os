"use client";
import React, { useState } from "react";
import { Layers, Loader2, Copy, Check, TrendingUp, DollarSign, MessageSquare, Mic, Users, BookOpen, ChevronDown, ChevronUp, Star } from "lucide-react";

const TOOLS = [
  { id: "sales-playbook", label: "Sales Playbook", icon: <BookOpen className="w-5 h-5" />, color: "from-purple-600 to-indigo-600", bg: "bg-purple-500/10 border-purple-500/20", desc: "استراتيجية التسعير والمبيعات" },
  { id: "finance-ops", label: "Finance Ops", icon: <DollarSign className="w-5 h-5" />, color: "from-green-600 to-teal-600", bg: "bg-green-500/10 border-green-500/20", desc: "تحليل ROI و CAC والمؤشرات المالية" },
  { id: "x-post", label: "X Thread Writer", icon: <MessageSquare className="w-5 h-5" />, color: "from-gray-600 to-slate-600", bg: "bg-gray-500/10 border-gray-500/20", desc: "خيوط X عربية فيرالية" },
  { id: "podcast", label: "Podcast Ops", icon: <Mic className="w-5 h-5" />, color: "from-red-600 to-pink-600", bg: "bg-red-500/10 border-red-500/20", desc: "تحويل البودكاست لمحتوى متعدد" },
  { id: "team-ops", label: "Team Ops", icon: <Users className="w-5 h-5" />, color: "from-blue-600 to-sky-600", bg: "bg-blue-500/10 border-blue-500/20", desc: "قرارات الفريق وخطة التسليم" },
];

export default function StudioClient() {
  const [activeTool, setActiveTool] = useState("sales-playbook");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const setField = (k: string, v: string) => setFields(prev => ({ ...prev, [`${activeTool}_${k}`]: v }));
  const getField = (k: string) => fields[`${activeTool}_${k}`] || "";

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null); setError("");
    try {
      const payload: any = { tool: activeTool };
      // Map fields per tool
      if (activeTool === "sales-playbook") Object.assign(payload, { service: getField("service"), targetClient: getField("targetClient"), currentPrice: getField("price"), competitors: getField("competitors") });
      else if (activeTool === "finance-ops") Object.assign(payload, { adSpend: getField("adSpend"), leads: getField("leads"), conversions: getField("conversions"), revenue: getField("revenue"), period: getField("period") });
      else if (activeTool === "x-post") Object.assign(payload, { topic: getField("topic"), angle: getField("angle"), expertise: getField("expertise"), tweetCount: parseInt(getField("count") || "12") });
      else if (activeTool === "podcast") Object.assign(payload, { transcript: getField("transcript"), podcastName: getField("podcastName"), guestName: getField("guestName") });
      else if (activeTool === "team-ops") Object.assign(payload, { meetingNotes: getField("notes"), teamSize: getField("size"), period: getField("period") });

      const res = await fetch("/api/studio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) setResult(data.result);
      else setError(data.error);
    } catch { setError("خطأ في الاتصال"); }
    setIsRunning(false);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const Collapsible = ({ title, children, id }: { title: string; children: React.ReactNode; id: string }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button onClick={() => setExpanded(expanded === id ? null : id)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="font-bold text-white text-sm">{title}</span>
        {expanded === id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded === id && <div className="px-4 pb-4 border-t border-gray-800 pt-4">{children}</div>}
    </div>
  );

  const CopyBlock = ({ label, text, id }: { label: string; text: string; id: string }) => (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <button onClick={() => copyText(text, id)} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
          {copied === id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied === id ? "تم" : "نسخ"}
        </button>
      </div>
      <p className="text-sm text-gray-200 leading-7 whitespace-pre-wrap">{text}</p>
    </div>
  );

  const tool = TOOLS.find(t => t.id === activeTool);

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-gray-950 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/3 rounded-full blur-[100px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-white/60" />
            <span className="text-xs text-white/50 font-bold uppercase tracking-widest">APEX STUDIO</span>
            <span className="text-xs bg-white/5 text-white/40 border border-white/10 px-2 py-0.5 rounded-full">sales-playbook + finance-ops + x-post + podcast + team-ops</span>
          </div>
          <h1 className="text-2xl font-black text-white">استوديو APEX</h1>
          <p className="text-gray-400 text-sm mt-1">5 أدوات تسويقية متقدمة في مكان واحد</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tool Selector */}
        <div className="space-y-2">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(null); setError(""); }}
              className={`w-full text-right p-4 rounded-2xl border transition-all ${activeTool === t.id ? `${t.bg} border-opacity-50` : "bg-gray-900 border-gray-800 hover:border-gray-700"}`}>
              <div className={`flex items-center gap-2 font-bold text-sm ${activeTool === t.id ? "text-white" : "text-gray-300"}`}>
                <span className={activeTool === t.id ? "text-white" : "text-gray-500"}>{t.icon}</span>
                {t.label}
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-5">
          {/* Input Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className={`p-1.5 rounded-lg bg-gradient-to-r ${tool?.color} text-white`}>{tool?.icon}</span>
              {tool?.label}
            </h2>

            {/* SALES PLAYBOOK */}
            {activeTool === "sales-playbook" && (
              <div className="space-y-3">
                <div><label className="text-xs font-bold text-gray-400 block mb-1">الخدمة المُباعة</label><input value={getField("service")} onChange={e => setField("service", e.target.value)} placeholder="إدارة حسابات السوشيال ميديا" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                <div><label className="text-xs font-bold text-gray-400 block mb-1">العميل المستهدف</label><input value={getField("targetClient")} onChange={e => setField("targetClient", e.target.value)} placeholder="أصحاب المطاعم والمقاهي" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-purple-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">السعر الحالي</label><input value={getField("price")} onChange={e => setField("price", e.target.value)} placeholder="3000 ريال/شهر" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">المنافسون</label><input value={getField("competitors")} onChange={e => setField("competitors", e.target.value)} placeholder="وكالة X، وكالة Y" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-purple-500 outline-none" /></div>
                </div>
              </div>
            )}

            {/* FINANCE OPS */}
            {activeTool === "finance-ops" && (
              <div className="space-y-3">
                <div><label className="text-xs font-bold text-gray-400 block mb-1">الفترة</label><input value={getField("period")} onChange={e => setField("period", e.target.value)} placeholder="أبريل 2026" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-green-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  {[["adSpend","الإنفاق الإعلاني (ريال)","5000"],["leads","عدد الـ Leads","120"],["conversions","التحويلات (مبيعات)","8"],["revenue","الإيرادات (ريال)","45000"]].map(([k,l,p]) => (
                    <div key={k}><label className="text-xs font-bold text-gray-400 block mb-1">{l}</label><input value={getField(k)} onChange={e => setField(k, e.target.value)} placeholder={p} className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-green-500 outline-none" /></div>
                  ))}
                </div>
              </div>
            )}

            {/* X POST */}
            {activeTool === "x-post" && (
              <div className="space-y-3">
                <div><label className="text-xs font-bold text-gray-400 block mb-1">موضوع الخيط</label><input value={getField("topic")} onChange={e => setField("topic", e.target.value)} placeholder="لماذا 90% من الإعلانات تفشل (وكيف تفعل الـ 10%)" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-gray-500 outline-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">زاوية الطرح</label><input value={getField("angle")} onChange={e => setField("angle", e.target.value)} placeholder="مفاجئة وعكس التوقعات" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-gray-500 outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">عدد التغريدات</label><input type="number" value={getField("count") || "12"} onChange={e => setField("count", e.target.value)} min="5" max="20" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-gray-500 outline-none" /></div>
                </div>
                <div><label className="text-xs font-bold text-gray-400 block mb-1">مجال خبرتك</label><input value={getField("expertise")} onChange={e => setField("expertise", e.target.value)} placeholder="تسويق رقمي ومبيعات" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-gray-500 outline-none" /></div>
              </div>
            )}

            {/* PODCAST */}
            {activeTool === "podcast" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">اسم البودكاست</label><input value={getField("podcastName")} onChange={e => setField("podcastName", e.target.value)} placeholder="بودكاست النمو" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-red-500 outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">اسم الضيف</label><input value={getField("guestName")} onChange={e => setField("guestName", e.target.value)} placeholder="محمد المطيري" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-red-500 outline-none" /></div>
                </div>
                <div><label className="text-xs font-bold text-gray-400 block mb-1">نص/ملخص الحلقة</label><textarea value={getField("transcript")} onChange={e => setField("transcript", e.target.value)} placeholder="محتوى الحلقة أو ملاحظاتك عنها..." className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:ring-2 focus:ring-red-500 outline-none min-h-[100px] resize-none" /></div>
              </div>
            )}

            {/* TEAM OPS */}
            {activeTool === "team-ops" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">حجم الفريق</label><input value={getField("size")} onChange={e => setField("size", e.target.value)} placeholder="5" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="text-xs font-bold text-gray-400 block mb-1">الفترة</label><input value={getField("period")} onChange={e => setField("period", e.target.value)} placeholder="الأسبوع الأول من أبريل" className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none" /></div>
                </div>
                <div><label className="text-xs font-bold text-gray-400 block mb-1">ملاحظات الاجتماع / أداء الفريق</label><textarea value={getField("notes")} onChange={e => setField("notes", e.target.value)} placeholder="ألصق ملاحظات اجتماعك أو وصف أداء الفريق..." className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none" /></div>
              </div>
            )}

            <button onClick={handleRun} disabled={isRunning}
              className={`mt-4 w-full h-12 bg-gradient-to-r ${tool?.color} text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 active:scale-95`}>
              {isRunning ? <Loader2 className="w-5 h-5 animate-spin" /> : tool?.icon}
              {isRunning ? "جاري التوليد..." : `تشغيل ${tool?.label}`}
            </button>
            {error && <p className="text-red-400 text-xs p-2 bg-red-900/20 border border-red-900/50 rounded-lg mt-2">{error}</p>}
          </div>

          {/* Results */}
          {!result && !isRunning && (
            <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-20 text-gray-600">
              <Layers className="w-16 h-16 mb-4 opacity-20" /><p className="font-bold">اختر أداة وشغّلها</p>
            </div>
          )}
          {isRunning && (
            <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-white/20 animate-spin mb-4" />
              <p className="text-gray-400 animate-pulse">يولّد {tool?.label}...</p>
            </div>
          )}

          {result && !isRunning && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">

              {/* SALES PLAYBOOK RESULTS */}
              {activeTool === "sales-playbook" && (
                <>
                  {result.valueProp && <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5"><h3 className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">عرض القيمة الفريد</h3><p className="text-lg font-bold text-white">{result.valueProp}</p></div>}
                  {result.tiers?.length > 0 && <Collapsible title="📦 باقات التسعير المقترحة" id="tiers"><div className="grid grid-cols-3 gap-3">{result.tiers.map((t: any, i: number) => (<div key={i} className={`p-4 rounded-xl border text-center ${i === 1 ? "bg-purple-900/20 border-purple-500/30" : "bg-gray-950 border-gray-800"}`}><div className="font-black text-white text-sm">{t.name}</div><div className={`text-xl font-black mt-1 ${i === 1 ? "text-purple-400" : "text-gray-300"}`}>{t.price}</div><div className="text-xs text-gray-500 mt-2">{t.includes}</div><div className="text-xs text-gray-600 mt-1">لـ {t.target}</div></div>))}</div></Collapsible>}
                  {result.objections?.length > 0 && <Collapsible title="🛡️ ردود الاعتراضات" id="objs"><div className="space-y-3">{result.objections.map((o: any, i: number) => (<div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3"><div className="text-xs font-bold text-red-400 mb-1">الاعتراض: {o.objection}</div><div className="text-sm text-green-300">← {o.response}</div></div>))}</div></Collapsible>}
                  {result.questions?.length > 0 && <Collapsible title="❓ أسئلة الاستكشاف" id="qs"><div className="space-y-2">{result.questions.map((q: string, i: number) => (<div key={i} className="text-sm text-gray-300 bg-gray-950 rounded-lg p-3 border border-gray-800">{i + 1}. {q}</div>))}</div></Collapsible>}
                  {result.closes?.length > 0 && <Collapsible title="🤝 نصوص الإغلاق" id="closes"><div className="space-y-3">{result.closes.map((c: any, i: number) => <CopyBlock key={i} label={c.style} text={c.script} id={`close_${i}`} />)}</div></Collapsible>}
                </>
              )}

              {/* FINANCE RESULTS */}
              {activeTool === "finance-ops" && (
                <>
                  {result.metrics?.length > 0 && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="font-bold text-white mb-3">📊 المؤشرات المالية</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{result.metrics.map((m: any, i: number) => (<div key={i} className={`p-3 rounded-xl border ${m.rating?.includes("excellent") ? "bg-green-900/10 border-green-500/20" : m.rating?.includes("good") ? "bg-blue-900/10 border-blue-500/20" : "bg-red-900/10 border-red-500/20"}`}><div className="text-xs text-gray-500 mb-1">{m.name}</div><div className={`text-lg font-black ${m.rating?.includes("excellent") ? "text-green-400" : m.rating?.includes("good") ? "text-blue-400" : "text-red-400"}`}>{m.value}</div><div className="text-xs text-gray-600 mt-0.5">{m.formula}</div></div>))}</div></div>}
                  {result.analysis && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="font-bold text-gray-400 text-sm mb-2">📋 التحليل</h3><p className="text-gray-200 text-sm leading-7">{result.analysis}</p></div>}
                  {result.recommendations?.length > 0 && <Collapsible title="💡 التوصيات المالية" id="recs"><div className="space-y-2">{result.recommendations.map((r: any, i: number) => (<div key={i} className="flex items-start gap-3 bg-gray-950 rounded-lg p-3 border border-gray-800"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${r.priority?.includes("high") ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"}`}>{r.priority}</span><div><div className="text-sm text-gray-200">{r.rec}</div><div className="text-xs text-green-400 mt-0.5">{r.impact}</div></div></div>))}</div></Collapsible>}
                  {result.forecast && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><h3 className="font-bold text-gray-400 text-sm mb-2">🔮 التوقعات</h3><p className="text-gray-200 text-sm leading-7">{result.forecast}</p></div>}
                </>
              )}

              {/* X POST RESULTS */}
              {activeTool === "x-post" && result.tweets?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2"><MessageSquare className="w-4 h-4" /> الخيط كاملاً ({result.tweets.length} تغريدات)</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> خطاف: {result.hookScore}/10</span>
                      <button onClick={() => copyText(result.tweets.map((t: string, i: number) => `${i + 1}/ ${t}`).join("\n\n"), "all_tweets")} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"><Copy className="w-3 h-3" />{copied === "all_tweets" ? "تم!" : "نسخ الكل"}</button>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pl-2">
                    {result.tweets.map((tweet: string, i: number) => (
                      <div key={i} className={`bg-gray-950 border rounded-xl p-4 ${i === 0 ? "border-yellow-500/30 bg-yellow-900/5" : "border-gray-800"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm text-gray-200 leading-7 flex-1">{i + 1}/ {tweet}</div>
                          <button onClick={() => copyText(tweet, `tweet_${i}`)} className="text-gray-600 hover:text-gray-400 shrink-0">{copied === `tweet_${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}</button>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">{tweet.length}/280 حرف</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PODCAST RESULTS */}
              {activeTool === "podcast" && (
                <div className="space-y-4">
                  {result.summary && <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5"><h3 className="text-sm font-bold text-red-400 mb-2">ملخص الحلقة</h3><p className="text-gray-200 text-sm leading-7">{result.summary}</p></div>}
                  {result.quotes?.length > 0 && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="text-sm font-bold text-white mb-3">💬 أبرز الاقتباسات</h3><div className="space-y-2">{result.quotes.map((q: string, i: number) => <div key={i} className="text-sm text-gray-200 italic bg-gray-950 rounded-lg p-3 border border-gray-800">"{q}"</div>)}</div></div>}
                  {result.linkedin && <CopyBlock label="LinkedIn Post" text={result.linkedin} id="linkedin" />}
                  {result.instagram && <CopyBlock label="Instagram Caption" text={result.instagram} id="instagram" />}
                  {result.xHook && <CopyBlock label="X Thread Hook 🧵" text={result.xHook} id="xhook" />}
                  {result.blogOutline && <Collapsible title="📝 مخطط مقال البلوق" id="blog"><p className="text-sm text-gray-200 leading-7 whitespace-pre-wrap">{result.blogOutline}</p></Collapsible>}
                  {result.newsletter && <CopyBlock label="قسم النشرة البريدية" text={result.newsletter} id="newsletter" />}
                </div>
              )}

              {/* TEAM RESULTS */}
              {activeTool === "team-ops" && (
                <div className="space-y-4">
                  {result.actions?.length > 0 && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5"><h3 className="font-bold text-white mb-3">✅ المهام المُسنَدة</h3><div className="space-y-2">{result.actions.map((a: any, i: number) => (<div key={i} className="flex items-start gap-3 bg-gray-950 border border-gray-800 rounded-lg p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${a.priority?.includes("high") ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/30"}`}>{a.priority}</span><div><div className="text-sm text-gray-200">{a.task}</div><div className="text-xs text-gray-500 mt-0.5">👤 {a.owner} | 📅 {a.deadline}</div></div></div>))}</div></div>}
                  {result.decisions?.length > 0 && <Collapsible title="🎯 القرارات المتخذة" id="decisions"><div className="space-y-2">{result.decisions.map((d: any, i: number) => (<div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3"><div className="text-sm font-bold text-white">{d.decision}</div><div className="text-xs text-gray-500 mt-1">👤 {d.owner} | 📅 {d.deadline}</div></div>))}</div></Collapsible>}
                  {result.performance && <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4"><h3 className="font-bold text-gray-400 text-sm mb-2">📊 تقييم الأداء</h3><p className="text-gray-200 text-sm leading-7">{result.performance}</p></div>}
                  {result.nextWeek && <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4"><h3 className="font-bold text-blue-400 text-sm mb-2">🔜 أولويات الأسبوع القادم</h3><p className="text-gray-200 text-sm leading-7 whitespace-pre-wrap">{result.nextWeek}</p></div>}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
