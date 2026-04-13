"use client";
import React, { useState } from "react";
import { BarChart3, Loader2, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Target, Zap, FileText } from "lucide-react";

const TREND_ICON = (t: string) => {
  if (t === "up") return <TrendingUp className="w-4 h-4 text-green-400" />;
  if (t === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};
const PRIORITY_COLOR = { high: "text-red-400 bg-red-500/10 border-red-500/30", medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30", low: "text-blue-400 bg-blue-500/10 border-blue-500/30" };

export default function VaultClient() {
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("تسويق رقمي");
  const [period, setPeriod] = useState("أبريل 2026");
  const [metrics, setMetrics] = useState({ leads: "", revenue: "", conversions: "", traffic: "", adSpend: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/analytics/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, industry, period, metrics }),
      });
      const data = await res.json();
      if (data.success) setReport(data.report);
      else setError(data.error);
    } catch { setError("خطأ في الاتصال"); }
    setIsGenerating(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 to-gray-950 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">VAULT ENGINE</span>
              <span className="text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">من revenue-intelligence</span>
            </div>
            <h1 className="text-2xl font-black text-white">تقارير ذكاء الإيرادات</h1>
            <p className="text-gray-400 text-sm mt-1">حوّل بيانات مبيعاتك لتقرير تنفيذي شامل مع خطة إجراءات فورية</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> بيانات التقرير</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">اسم العميل / شركتك</label>
              <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="مثال: شركة النور للتسويق"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">القطاع</label>
                <input value={industry} onChange={e => setIndustry(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">الفترة</label>
                <input value={period} onChange={e => setPeriod(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <div className="border-t border-gray-800 pt-3">
              <p className="text-xs font-bold text-gray-400 mb-3">البيانات (اختياري — أتركها فارغة ويولّد AI تقديرات)</p>
              {[
                { key: "leads", label: "Leads المؤهلون" },
                { key: "revenue", label: "الإيرادات (ريال)" },
                { key: "conversions", label: "معدل التحويل %" },
                { key: "traffic", label: "الزوار الشهريون" },
                { key: "adSpend", label: "إنفاق الإعلانات" },
              ].map(f => (
                <div key={f.key} className="mb-2">
                  <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                  <input value={(metrics as any)[f.key]} onChange={e => setMetrics({ ...metrics, [f.key]: e.target.value })} placeholder="..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg h-9 px-3 text-sm text-gray-200 focus:ring-1 focus:ring-emerald-500 outline-none" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={isGenerating}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
              {isGenerating ? "جاري إنشاء التقرير..." : "إنشاء التقرير الذكي"}
            </button>
            {error && <p className="text-red-400 text-xs p-2 bg-red-900/20 border border-red-900/50 rounded-lg">{error}</p>}
          </form>
        </div>

        {/* Report */}
        <div className="lg:col-span-2 space-y-4">
          {!report && !isGenerating && (
            <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
              <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold">VAULT جاهز لتوليد تقريرك</p>
              <p className="text-sm mt-1">أدخل البيانات وسيولّد AI تقريراً تنفيذياً شاملاً</p>
            </div>
          )}
          {isGenerating && (
            <div className="border-2 border-dashed border-emerald-900/30 rounded-3xl flex flex-col items-center justify-center py-20 text-emerald-600/50">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold animate-pulse text-emerald-400">يحلل VAULT بياناتك...</p>
            </div>
          )}
          {report && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* Summary */}
              <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5">
                <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> الملخص التنفيذي</h3>
                <p className="text-gray-200 text-sm leading-7">{report.summary}</p>
              </div>

              {/* KPIs */}
              {report.kpis?.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3 text-sm">📊 مؤشرات الأداء الرئيسية</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {report.kpis.map((kpi: any, i: number) => (
                      <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{kpi.name}</span>
                          {TREND_ICON(kpi.trend)}
                        </div>
                        <div className="text-xl font-black text-white">{kpi.value || "—"}</div>
                        <div className={`text-xs font-bold mt-1 ${kpi.trend === "up" ? "text-green-400" : kpi.trend === "down" ? "text-red-400" : "text-gray-400"}`}>{kpi.change}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signals */}
              {report.signals?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2"><Target className="w-4 h-4 text-blue-400" /> إشارات الشراء</h3>
                  <div className="space-y-2">
                    {report.signals.map((s: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
                        <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        <div><div className="text-sm text-gray-200">{s.signal}</div><div className="text-xs text-blue-400 mt-1">→ {s.recommendation}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {report.actions?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3 text-sm">⚡ خطة الإجراءات — هذا الأسبوع</h3>
                  <div className="space-y-2">
                    {report.actions.map((a: any, i: number) => {
                      const pr = a.priority?.includes("high") ? "high" : a.priority?.includes("medium") ? "medium" : "low";
                      return (
                        <div key={i} className="flex items-start gap-3 bg-gray-950 rounded-lg p-3 border border-gray-800">
                          <span className={`text-xs font-black px-2 py-0.5 rounded-full border shrink-0 mt-0.5 ${PRIORITY_COLOR[pr as keyof typeof PRIORITY_COLOR] || PRIORITY_COLOR.low}`}>{pr}</span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-200">{a.action}</div>
                            {a.owner && <div className="text-xs text-gray-500 mt-0.5">المسؤول: {a.owner}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Forecast */}
              {report.forecast && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-2 text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400" /> توقعات الشهر القادم</h3>
                  <p className="text-gray-300 text-sm leading-7">{report.forecast}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
