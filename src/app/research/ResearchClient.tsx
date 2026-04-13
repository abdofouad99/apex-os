"use client";
import React, { useState } from "react";
import { Microscope, Loader2, Trophy, TrendingUp, Star, Copy, Check, Globe, AlertCircle, CheckCircle, XCircle, Zap } from "lucide-react";

export default function ResearchClient() {
  const [activeTab, setActiveTab] = useState<"optimize" | "cro">("optimize");

  // AutoResearch state
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("ad");
  const [industry, setIndustry] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [optError, setOptError] = useState("");
  const [copied, setCopied] = useState(false);

  // CRO state
  const [croUrl, setCroUrl] = useState("");
  const [croIndustry, setCroIndustry] = useState("agency");
  const [isCRO, setIsCRO] = useState(false);
  const [croResult, setCroResult] = useState<any>(null);
  const [croError, setCroError] = useState("");

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOptimizing(true);
    setOptimizeResult(null);
    setOptError("");
    try {
      const res = await fetch("/api/research/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, topic, contentType, industry }),
      });
      const data = await res.json();
      if (data.success) setOptimizeResult(data);
      else setOptError(data.error);
    } catch { setOptError("خطأ في الاتصال"); }
    setIsOptimizing(false);
  };

  const handleCRO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCRO(true);
    setCroResult(null);
    setCroError("");
    try {
      const res = await fetch("/api/conversion/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: croUrl, industry: croIndustry }),
      });
      const data = await res.json();
      if (data.success) setCroResult(data);
      else setCroError(data.error);
    } catch { setCroError("خطأ في الاتصال"); }
    setIsCRO(false);
  };

  const GRADE_COLOR: Record<string, string> = { "A+": "text-green-400", "A": "text-green-400", "B": "text-yellow-400", "C": "text-orange-400", "D": "text-red-400", "F": "text-red-600" };
  const SCORE_BAR = (score: number) => `${Math.min(100, Math.max(0, score))}%`;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 to-gray-950 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Microscope className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">RESEARCH LAB</span>
            <span className="text-xs bg-amber-600/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">autoresearch + conversion-ops</span>
          </div>
          <h1 className="text-2xl font-black text-white">مختبر الأبحاث والتحويل</h1>
          <p className="text-gray-400 text-sm mt-1">Karpathy-style optimization + CRO Audit لصفحات الهبوط</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab("optimize")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "optimize" ? "bg-amber-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <Zap className="w-4 h-4" /> تحسين المحتوى (AutoResearch)
        </button>
        <button onClick={() => setActiveTab("cro")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "cro" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
          <Globe className="w-4 h-4" /> تدقيق صفحة الهبوط (CRO)
        </button>
      </div>

      {/* AutoResearch */}
      {activeTab === "optimize" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-1">AutoResearch</h3>
            <p className="text-xs text-gray-500 mb-4">يولّد 10 متغيرات ويطوّر الأفضل لـ 2 جولات</p>
            <form onSubmit={handleOptimize} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">نوع المحتوى</label>
                <select value={contentType} onChange={e => setContentType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none">
                  <option value="ad">إعلان</option><option value="email">بريد إلكتروني</option><option value="headline">عنوان</option><option value="landing_page">صفحة هبوط</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">القطاع</label>
                <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="تسويق، عقار، صحة..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">النص الحالي (أو موضوع للإنشاء)</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="أدخل النص الحالي لتحسينه..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none min-h-[100px] resize-none" />
              </div>
              {!content && (
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">أو موضوع جديد</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="إعلان لخدمة تسويق رقمي..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-amber-500 outline-none" />
                </div>
              )}
              <button type="submit" disabled={isOptimizing || (!content && !topic)}
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                {isOptimizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Microscope className="w-5 h-5" />}
                {isOptimizing ? "جاري التحسين (2 جولات)..." : "تحسين بـ AutoResearch"}
              </button>
              {optError && <p className="text-red-400 text-xs p-2 bg-red-900/20 border border-red-900/50 rounded-lg">{optError}</p>}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!optimizeResult && !isOptimizing && (
              <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
                <Microscope className="w-16 h-16 mb-4 opacity-20" /><p className="font-bold">AutoResearch جاهز</p>
                <p className="text-sm mt-1 text-center max-w-xs">يولّد 10 متغيرات ويقيّمها بـ 5 خبراء ثم يطوّر الأفضل</p>
              </div>
            )}
            {isOptimizing && (
              <div className="border-2 border-dashed border-amber-900/30 rounded-3xl flex flex-col items-center justify-center py-20">
                <Microscope className="w-12 h-12 text-amber-400 animate-pulse mb-4" />
                <p className="font-bold text-amber-400 animate-pulse">الجولة 1: توليد 10 متغيرات... ثم الجولة 2: التطوير</p>
              </div>
            )}
            {optimizeResult && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {/* Winner */}
                <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/10 border border-amber-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-white">النص الفائز</span>
                      <span className="text-xs bg-amber-600/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">{optimizeResult.winner?.score}/100</span>
                      <span className="text-xs text-green-400">+{optimizeResult.improvement || 0} تحسن</span>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(optimizeResult.winner?.text || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "تم" : "نسخ"}
                    </button>
                  </div>
                  <p className="text-gray-100 text-sm leading-8 font-medium whitespace-pre-wrap">{optimizeResult.winner?.text}</p>
                </div>

                {/* Top variants */}
                {optimizeResult.top3Initial?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-400 text-sm mb-3">الجولة الأولى — أفضل 3 من 10</h3>
                    <div className="space-y-2">
                      {optimizeResult.top3Initial.map((v: any, i: number) => (
                        <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-gray-500">#{i + 1}</span>
                            <span className="text-xs font-bold text-amber-400">{v.avg}/100</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-6">{v.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evolved */}
                {optimizeResult.evolved?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-bold text-gray-400 text-sm mb-3">الجولة الثانية — المتطورة</h3>
                    <div className="space-y-2">
                      {optimizeResult.evolved.slice(0, 3).map((v: any, i: number) => (
                        <div key={i} className="bg-gray-950 border border-gray-800 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-green-400">{v.reason}</span>
                            <span className="text-xs font-bold text-green-400">{v.score}/100</span>
                          </div>
                          <p className="text-xs text-gray-300 leading-6">{v.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRO Audit */}
      {activeTab === "cro" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-1">تدقيق CRO</h3>
            <p className="text-xs text-gray-500 mb-4">يقيّم صفحتك بـ 8 أبعاد تحويل ويعطيك درجة ورسالة</p>
            <form onSubmit={handleCRO} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">رابط الصفحة</label>
                <input type="url" required value={croUrl} onChange={e => setCroUrl(e.target.value)} placeholder="https://yoursite.com/landing"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">القطاع</label>
                <select value={croIndustry} onChange={e => setCroIndustry(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-10 px-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="agency">وكالة تسويق</option><option value="saas">SaaS</option><option value="ecommerce">تجارة إلكترونية</option>
                  <option value="b2b">B2B</option><option value="healthcare">صحة</option><option value="education">تعليم</option><option value="general">عام</option>
                </select>
              </div>
              <button type="submit" disabled={isCRO}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                {isCRO ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                {isCRO ? "جاري التدقيق..." : "تدقيق الصفحة الآن"}
              </button>
              {croError && <p className="text-red-400 text-xs p-2 bg-red-900/20 border border-red-900/50 rounded-lg">{croError}</p>}
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!croResult && !isCRO && (
              <div className="border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
                <Globe className="w-16 h-16 mb-4 opacity-20" /><p className="font-bold">أدخل رابط صفحة الهبوط</p>
                <p className="text-sm mt-1 text-center max-w-xs">يُقيّم 8 أبعاد تحويل ويعطيك درجة ورسالة وتوصيات مباشرة</p>
              </div>
            )}
            {isCRO && (
              <div className="border-2 border-dashed border-blue-900/30 rounded-3xl flex flex-col items-center justify-center py-20">
                <Globe className="w-12 h-12 text-blue-400 animate-pulse mb-4" />
                <p className="font-bold text-blue-400 animate-pulse">يجلب ويحلل الصفحة...</p>
              </div>
            )}
            {croResult && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {/* Overall Score */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">نتيجة التدقيق</h3>
                      <p className="text-sm text-gray-400 mt-1">{croResult.summary}</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-5xl font-black ${GRADE_COLOR[croResult.grade] || "text-white"}`}>{croResult.grade}</div>
                      <div className="text-gray-500 text-sm">{croResult.overall}/100</div>
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                {croResult.dimensions?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3">📊 تقييم الأبعاد الثمانية</h3>
                    <div className="space-y-3">
                      {croResult.dimensions.map((d: any, i: number) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-300">{d.name}</span>
                            <span className={`text-sm font-black ${d.score >= 70 ? "text-green-400" : d.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>{d.score}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${d.score >= 70 ? "bg-green-500" : d.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: SCORE_BAR(d.score) }} />
                          </div>
                          {d.fix && <p className="text-xs text-blue-400 mt-1">💡 {d.fix}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Fixes */}
                {croResult.fixes?.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="font-bold text-white mb-3">🔧 الإصلاحات ذات الأولوية</h3>
                    <div className="space-y-2">
                      {croResult.fixes.map((f: any, i: number) => (
                        <div key={i} className={`flex items-start gap-3 rounded-lg p-3 border ${i === 0 ? "bg-red-900/10 border-red-500/20" : "bg-gray-950 border-gray-800"}`}>
                          <span className="text-sm shrink-0 mt-0.5">{i === 0 ? "🔴" : "🟡"}</span>
                          <div>
                            <div className="text-sm font-bold text-gray-200">{f.fix}</div>
                            <div className="text-xs text-gray-500 mt-0.5">التأثير: {f.impact}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
