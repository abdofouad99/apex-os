"use client";

import React, { useState, useEffect } from "react";
import {
  FlaskConical, Plus, Play, TrendingUp, Trophy, BarChart2,
  Loader2, ChevronDown, ChevronUp, BookOpen, Zap, CheckCircle,
  Clock, XCircle, ArrowUp, Target, Beaker
} from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  variable: string;
  metric: string;
  status: "RUNNING" | "TRENDING" | "KEEP" | "DISCARD";
  variants: string[];
  winnerId: string | null;
  minSamples: number;
  variantStats: Record<string, { count: number; sum: number; avg: number }>;
  dataPoints: any[];
  createdAt: string;
}

interface PlaybookRule {
  id: string;
  rule: string;
  evidence: string;
  lift: number;
  channel: string;
  addedAt: string;
}

const STATUS_CONFIG = {
  RUNNING: { label: "جاري", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", icon: <Clock className="w-3 h-3" /> },
  TRENDING: { label: "واعد", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: <TrendingUp className="w-3 h-3" /> },
  KEEP: { label: "فائز ✅", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: <CheckCircle className="w-3 h-3" /> },
  DISCARD: { label: "مُهمَل", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: <XCircle className="w-3 h-3" /> },
};

const METRICS = ["impressions", "clicks", "conversions", "engagement", "leads", "revenue"];
const CHANNELS = ["content", "email", "linkedin", "instagram", "seo", "ads"];

export default function PulseClient() {
  const [tab, setTab] = useState<"experiments" | "create" | "playbook">("experiments");
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [playbook, setPlaybook] = useState<PlaybookRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

  // Log data point modal
  const [logModal, setLogModal] = useState<{ expId: string; variants: string[] } | null>(null);
  const [logVariant, setLogVariant] = useState("");
  const [logValue, setLogValue] = useState("");
  const [logMetric, setLogMetric] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  // Create form
  const [form, setForm] = useState({
    name: "", hypothesis: "", variable: "content",
    metric: "clicks", variantA: "", variantB: "", minSamples: "15"
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, playRes] = await Promise.all([
        fetch("/api/growth/experiments"),
        fetch("/api/growth/playbook"),
      ]);
      const expData = await expRes.json();
      const playData = await playRes.json();
      if (expData.success) setExperiments(expData.experiments);
      if (playData.success) setPlaybook(playData.rules);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMsg("");
    try {
      const res = await fetch("/api/growth/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: form.name,
          hypothesis: form.hypothesis,
          variable: form.variable,
          metric: form.metric,
          variants: [form.variantA, form.variantB],
          minSamples: parseInt(form.minSamples),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateMsg("✅ تم إنشاء التجربة بنجاح!");
        setForm({ name: "", hypothesis: "", variable: "content", metric: "clicks", variantA: "", variantB: "", minSamples: "15" });
        await fetchData();
        setTimeout(() => setTab("experiments"), 1500);
      } else {
        setCreateMsg("❌ " + data.error);
      }
    } catch (e) { setCreateMsg("❌ خطأ في الاتصال"); }
    setIsCreating(false);
  };

  const handleLog = async () => {
    if (!logModal || !logVariant || !logValue) return;
    setIsLogging(true);
    try {
      await fetch("/api/growth/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log",
          experimentId: logModal.expId,
          variant: logVariant,
          metrics: { [logMetric]: parseFloat(logValue) },
        }),
      });
      setLogModal(null);
      setLogVariant(""); setLogValue(""); setLogMetric("");
      await fetchData();
    } catch (e) { console.error(e); }
    setIsLogging(false);
  };

  const runningCount = experiments.filter(e => e.status === "RUNNING").length;
  const winCount = experiments.filter(e => e.status === "KEEP").length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">PULSE Engine</span>
              <span className="text-xs bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">من ai-marketing-skills</span>
            </div>
            <h1 className="text-2xl font-black text-white">محرك تجارب النمو الإحصائي</h1>
            <p className="text-gray-400 text-sm mt-1">اختبر أي متغير واعرف الفائز بدقة إحصائية حقيقية (Mann-Whitney U)</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
              <div className="text-2xl font-black text-blue-400">{runningCount}</div>
              <div className="text-xs text-gray-500">تجربة جارية</div>
            </div>
            <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
              <div className="text-2xl font-black text-green-400">{winCount}</div>
              <div className="text-xs text-gray-500">فائزة في الـ Playbook</div>
            </div>
            <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl px-5 py-3">
              <div className="text-2xl font-black text-purple-400">{playbook.length}</div>
              <div className="text-xs text-gray-500">قاعدة مثبتة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {([
          { id: "experiments", label: "التجارب", icon: <Beaker className="w-4 h-4" /> },
          { id: "create", label: "إنشاء تجربة", icon: <Plus className="w-4 h-4" /> },
          { id: "playbook", label: "القواعد الفائزة", icon: <BookOpen className="w-4 h-4" /> },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.id ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── EXPERIMENTS TAB ── */}
      {tab === "experiments" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          ) : experiments.length === 0 ? (
            <div className="text-center py-24 bg-gray-900/50 border border-dashed border-gray-800 rounded-3xl text-gray-600">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">لا توجد تجارب بعد</p>
              <p className="text-sm mt-2">اضغط على «إنشاء تجربة» لاختبار أول فرضيتك</p>
              <button onClick={() => setTab("create")} className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
                إنشاء تجربة الآن
              </button>
            </div>
          ) : (
            experiments.map((exp) => {
              const cfg = STATUS_CONFIG[exp.status];
              const isExpanded = expandedExp === exp.id;
              const totalPoints = exp.dataPoints?.length || 0;

              return (
                <div key={exp.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden transition-all">
                  <div className="p-5 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpandedExp(isExpanded ? null : exp.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-bold text-white text-lg">{exp.name}</h3>
                        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {exp.winnerId && (
                          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> الفائز: {exp.winnerId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{exp.hypothesis}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>📊 {exp.metric}</span>
                        <span>🔀 {(exp.variants as string[]).join(" vs ")}</span>
                        <span>📈 {totalPoints} نقطة بيانات</span>
                        <span>🎯 الحد الأدنى: {exp.minSamples}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {exp.status === "RUNNING" || exp.status === "TRENDING" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setLogModal({ expId: exp.id, variants: exp.variants as string[] }); setLogMetric(exp.metric); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold transition-all"
                        >
                          <Play className="w-3 h-3" /> تسجيل نتيجة
                        </button>
                      ) : null}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-800 p-5 bg-gray-950/50">
                      {/* Variant Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {(exp.variants as string[]).map((v) => {
                          const stats = exp.variantStats?.[v];
                          const isWinner = exp.winnerId === v;
                          return (
                            <div key={v} className={`p-4 rounded-xl border ${isWinner ? "bg-green-500/5 border-green-500/30" : "bg-gray-900 border-gray-800"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-white">{v}</span>
                                {isWinner && <Trophy className="w-4 h-4 text-yellow-400" />}
                              </div>
                              <div className="text-2xl font-black text-indigo-400">{stats?.avg?.toFixed(1) || "0"}</div>
                              <div className="text-xs text-gray-500">{exp.metric} (متوسط)</div>
                              <div className="text-xs text-gray-600 mt-1">{stats?.count || 0} عينة</div>
                              <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats?.count || 0) / exp.minSamples) * 100)}%` }} />
                              </div>
                              <div className="text-xs text-gray-600 mt-1">{Math.min(100, Math.round(((stats?.count || 0) / exp.minSamples) * 100))}% من الحد الأدنى</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── CREATE TAB ── */}
      {tab === "create" && (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> إنشاء تجربة A/B جديدة
          </h2>
          <p className="text-sm text-gray-500 mb-6">أدخل فرضيتك ودع PULSE يثبت أو يدحض بإحصاء حقيقي</p>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">اسم التجربة</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="مثال: اختبار نوع المنشور — خيط vs منشور واحد"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">الفرضية (Hypothesis)</label>
              <textarea required value={form.hypothesis} onChange={e => setForm({...form, hypothesis: e.target.value})}
                placeholder="مثال: منشورات الخيط (Thread) ستحصل على تفاعل أعلى بـ2x مقارنة بالمنشور الفردي"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">المتغير المُختبَر</label>
                <select value={form.variable} onChange={e => setForm({...form, variable: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">المقياس الرئيسي</label>
                <select value={form.metric} onChange={e => setForm({...form, metric: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                  {METRICS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">النسخة أ (Variant A)</label>
                <input type="text" required value={form.variantA} onChange={e => setForm({...form, variantA: e.target.value})}
                  placeholder="مثال: thread"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">النسخة ب (Variant B)</label>
                <input type="text" required value={form.variantB} onChange={e => setForm({...form, variantB: e.target.value})}
                  placeholder="مثال: single_post"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">الحد الأدنى للعينات (لكل نسخة)</label>
              <input type="number" value={form.minSamples} onChange={e => setForm({...form, minSamples: e.target.value})}
                min="5" max="100"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              <p className="text-xs text-gray-600 mt-1">الافتراضي 15 — منصات عالية الحجم: 10 | منصات منخفضة (SEO): 30</p>
            </div>

            <button type="submit" disabled={isCreating}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/40 transition-all active:scale-95 disabled:opacity-50">
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FlaskConical className="w-5 h-5" />}
              {isCreating ? "جاري الإنشاء..." : "إطلاق التجربة"}
            </button>

            {createMsg && <div className={`text-sm p-3 rounded-xl ${createMsg.includes("✅") ? "bg-green-900/20 text-green-400 border border-green-900/50" : "bg-red-900/20 text-red-400 border border-red-900/50"}`}>{createMsg}</div>}
          </form>
        </div>
      )}

      {/* ── PLAYBOOK TAB ── */}
      {tab === "playbook" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-green-400" />
              <h2 className="font-bold text-white">قواعد النمو المثبتة إحصائياً</h2>
            </div>
            <p className="text-sm text-gray-400">كل قاعدة هنا أثبتت تفوقها بـ p &lt; 0.05 و +15% رفعاً — تطبّق تلقائياً في FORGE</p>
          </div>

          {playbook.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 border border-dashed border-gray-800 rounded-3xl text-gray-600">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-bold">الـ Playbook فارغ حالياً</p>
              <p className="text-sm mt-1">أجرِ تجارب حتى تتراكم القواعد الفائزة هنا</p>
            </div>
          ) : (
            playbook.map((rule) => (
              <div key={rule.id} className="bg-gray-900 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs bg-green-600/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">{rule.channel}</span>
                    </div>
                    <p className="font-bold text-white leading-relaxed">{rule.rule}</p>
                    <p className="text-xs text-gray-500 mt-2">{rule.evidence}</p>
                  </div>
                  <div className="text-center bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 shrink-0">
                    <div className="flex items-center gap-1 text-green-400 font-black text-xl">
                      <ArrowUp className="w-4 h-4" />
                      {rule.lift}%
                    </div>
                    <div className="text-xs text-gray-500">رفع</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Log Data Point Modal */}
      {logModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLogModal(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-400" /> تسجيل نتيجة جديدة
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">النسخة</label>
                <div className="flex gap-2">
                  {logModal.variants.map(v => (
                    <button key={v} onClick={() => setLogVariant(v)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${logVariant === v ? "bg-indigo-600 text-white border-indigo-500" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">القيمة ({logMetric})</label>
                <input type="number" value={logValue} onChange={e => setLogValue(e.target.value)}
                  placeholder="مثال: 1250"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setLogModal(null)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold transition-all">إلغاء</button>
                <button onClick={handleLog} disabled={!logVariant || !logValue || isLogging}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isLogging ? "جاري..." : "تسجيل"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
