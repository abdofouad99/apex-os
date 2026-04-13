"use client";
import React, { useState } from "react";
import { Search, Loader2, Trophy, Star, TrendingUp, Copy, Check, PlayCircle, Globe, BarChart } from "lucide-react";

export default function IntelligenceClient() {
  const [tab, setTab] = useState<"seo" | "youtube">("seo");
  const [niche, setNiche] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [keywords, setKeywords] = useState("");
  const [ytChannels, setYtChannels] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: tab,
          niche,
          competitors: competitors.split(",").map(s => s.trim()).filter(Boolean),
          keywords: keywords.split(",").map(s => s.trim()).filter(Boolean),
          ytChannels: ytChannels.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (data.success) setResult(data);
      else setError(data.error);
    } catch { setError("خطأ في الاتصال"); }
    setIsAnalyzing(false);
  };

  const OPPORTUNITY_COLOR = (o: string) => o?.includes("high") ? "text-green-400 bg-green-500/10 border-green-500/30" : o?.includes("medium") ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" : "text-blue-400 bg-blue-500/10 border-blue-500/30";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-950 to-gray-950 border border-violet-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-violet-400" />
            <span className="text-xs text-violet-400 font-bold uppercase tracking-widest">INTELLIGENCE ENGINE</span>
            <span className="text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">seo-ops + yt-competitive-analysis</span>
          </div>
          <h1 className="text-2xl font-black text-white">محرك الاستخبارات التسويقية</h1>
          <p className="text-gray-400 text-sm mt-1">تحليل ترندات SEO + تحليل منافسي YouTube في مكان واحد</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button onClick={() => { setTab("seo"); setResult(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "seo" ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <Globe className="w-4 h-4" /> ترندات SEO
        </button>
        <button onClick={() => { setTab("youtube"); setResult(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === "youtube" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <PlayCircle className="w-4 h-4" /> تحليل YouTube
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">مجالك / نيشك</label>
              <input required value={niche} onChange={e => setNiche(e.target.value)} placeholder="مثال: تسويق عقاري في السعودية"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            {tab === "seo" ? (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">المنافسون (افصل بفاصلة)</label>
                  <input value={competitors} onChange={e => setCompetitors(e.target.value)} placeholder="competitor1.com, competitor2.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">كلماتك المفتاحية الحالية</label>
                  <input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="تسويق رقمي, سيو, إعلانات"
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none" />
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">قنوات للتحليل (اختياري)</label>
                <input value={ytChannels} onChange={e => setYtChannels(e.target.value)} placeholder="@channel1, @channel2"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none" />
              </div>
            )}
            <button type="submit" disabled={isAnalyzing}
              className={`w-full h-12 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${tab === "seo" ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500" : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"}`}>
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {isAnalyzing ? "جاري التحليل..." : tab === "seo" ? "تحليل ترندات SEO" : "تحليل YouTube"}
            </button>
            {error && <p className="text-red-400 text-xs p-2 bg-red-900/20 border border-red-900/50 rounded-lg">{error}</p>}
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {!result && !isAnalyzing && (
            <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold">ابدأ التحليل</p>
              <p className="text-sm mt-1 text-center max-w-xs">{tab === "seo" ? "يكتشف ثغرات المنافسين وفرص الكلمات المفتاحية" : "يكتشف أنماط الفيديوهات الفيرالية وفرص المحتوى"}</p>
            </div>
          )}
          {isAnalyzing && (
            <div className="border-2 border-dashed border-violet-900/30 rounded-3xl flex flex-col items-center justify-center py-20 text-violet-600/50">
              <Search className="w-12 h-12 animate-pulse mb-4" />
              <p className="font-bold text-violet-400 animate-pulse">يحلل النظام البيانات...</p>
            </div>
          )}

          {result?.type === "trends" && result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* Keywords */}
              {result.keywords?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2"><BarChart className="w-4 h-4 text-violet-400" /> الكلمات المفتاحية الفرصة</h3>
                  <div className="space-y-2">
                    {result.keywords.map((kw: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-950 rounded-lg p-3 border border-gray-800">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${OPPORTUNITY_COLOR(kw.opportunity)}`}>{kw.opportunity}</span>
                        <div className="flex-1 font-bold text-sm text-white">{kw.keyword}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>📊 {kw.volume}</span>
                          <span>🎯 صعوبة: {kw.difficulty}</span>
                          <span className="bg-gray-800 px-2 py-0.5 rounded-full">{kw.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Opportunities */}
              {result.opportunities?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3">✨ فرص المحتوى</h3>
                  <div className="space-y-2">
                    {result.opportunities.map((o: any, i: number) => (
                      <div key={i} className="bg-gray-950 rounded-lg p-3 border border-gray-800">
                        <div className="font-bold text-sm text-white">{o.topic}</div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span>📝 {o.type}</span><span>🔑 {o.keyword}</span><span>📈 {o.traffic}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Quick Wins */}
              {result.quickWins && (
                <div className="bg-green-900/10 border border-green-500/20 rounded-2xl p-5">
                  <h3 className="font-bold text-green-400 mb-2">⚡ Quick Wins — هذا الأسبوع</h3>
                  <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap">{result.quickWins}</p>
                </div>
              )}
            </div>
          )}

          {result?.type === "youtube" && result && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {result.formats?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-400" /> صيغ العناوين الفيرالية</h3>
                  <div className="space-y-2">
                    {result.formats.map((f: any, i: number) => (
                      <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{f.format}</span>
                          <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">{f.multiplier}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{f.reason}</div>
                        <div className="text-xs text-violet-400 mt-1">مثال: {f.example}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.hooks?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="font-bold text-white mb-3">🎣 خطافات الافتتاحية المثبتة</h3>
                  <div className="space-y-2">
                    {result.hooks.map((h: any, i: number) => (
                      <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                        <div className="font-bold text-sm text-violet-300">{h.hook}</div>
                        <div className="text-xs text-gray-400 mt-1">→ {h.example}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.outlierPatterns && (
                <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5">
                  <h3 className="font-bold text-red-400 mb-2">🚀 أنماط الفيديوهات الـ 2x+</h3>
                  <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap">{result.outlierPatterns}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
