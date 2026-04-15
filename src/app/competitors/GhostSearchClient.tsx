"use client";

import React, { useState } from "react";
import {
  Search, Loader2, TrendingUp, AlertCircle, Copy, Check,
  Eye, Play, Image as ImageIcon, BarChart3, Zap, ScanSearch,
  CheckCircle, XCircle, Globe, ExternalLink, RefreshCw, Brain
} from "lucide-react";

interface Ad {
  adId: string;
  pageName: string;
  adText: string;
  imageUrl: string;
  videoUrl: string;
  isActive: boolean;
  startDate: string | null;
  ctaText: string | null;
  linkUrl: string | null;
}

interface ScanResult {
  pageUrl: string;
  pageName: string;
  totalAds: number;
  activeAds: number;
  totalPosts?: number;
  ads: Ad[];
  pageInfo?: { page_id?: string; creation_date?: string; ad_status?: string } | null;
  adStatus?: string | null;
  noAdsReason?: string | null;
  isOrganicFallback?: boolean;
}

const LOADING_STAGES = [
  { label: "🔍 تحديد الصفحة وفحص الرابط...", delay: 0 },
  { label: "👻 إطلاق الشبح نحو مكتبة الإعلانات...", delay: 3000 },
  { label: "📦 جمع الإعلانات النشطة والمنتهية...", delay: 8000 },
  { label: "🔬 تحليل محتوى الإعلانات...", delay: 15000 },
  { label: "📊 بناء التقرير الاستراتيجي...", delay: 25000 },
];

export default function GhostSearchClient() {
  const [pageUrl, setPageUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [report, setReport] = useState("");
  const [reportSource, setReportSource] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"ads" | "report">("ads");

  // Normalize URL
  const normalizeUrl = (url: string) => {
    if (!url) return "";
    if (!url.startsWith("http")) return "https://" + url;
    return url;
  };

  // ── Scrape Ads ──
  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageUrl.trim()) return;

    const normalized = normalizeUrl(pageUrl.trim());
    setIsScanning(true);
    setError("");
    setResult(null);
    setReport("");
    setLoadingStage(0);

    // Progress animation
    LOADING_STAGES.forEach((stage, i) => {
      if (i > 0) setTimeout(() => setLoadingStage(i), stage.delay);
    });

    try {
      const res = await fetch("/api/ghost/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: normalized })
      });

      const data = await res.json();

      if (res.status === 402 || data.error === "APIFY_QUOTA_EXCEEDED") {
        setError("QUOTA_EXCEEDED");
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل جلب الإعلانات");
      }

      setResult(data);
      setActiveTab("ads");
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setIsScanning(false);
    }
  };

  // ── AI Analyze Ads ──
  const handleAnalyze = async () => {
    if (!result) return;
    setIsAnalyzing(true);
    setReport("");
    setActiveTab("report");

    try {
      const res = await fetch("/api/ghost/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ads: result.ads,
          pageUrl: result.pageUrl,
          pageName: result.pageName,
          noAdsMode: result.ads.length === 0 && !result.isOrganicFallback,
          adStatus: result.adStatus,
          pageInfo: result.pageInfo,
          isOrganicFallback: result.isOrganicFallback
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "فشل التحليل");

      setReport(data.report);
      setReportSource(data.source);
    } catch (err: any) {
      setError(err.message);
      setActiveTab("ads");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const copyReport = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── UI ───
  return (
    <div className="min-h-screen bg-[#0a0f1c] font-sans" dir="rtl">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 text-xs text-purple-400 mb-5">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            مكتبة إعلانات Facebook — بيانات حقيقية
          </div>
          <h1 className="text-4xl font-black text-white mb-3">
            👻 <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">الشبح</span>
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto">
            أدخل رابط أي صفحة Facebook — سواء منافسيك أو صفحتك — لاستخراج إعلاناتها الحقيقية وتحليلها بالذكاء الاصطناعي
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleScan} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={pageUrl}
                onChange={e => setPageUrl(e.target.value)}
                placeholder="facebook.com/alabeer.marketing أو رابط أي صفحة منافسة"
                className="w-full h-13 bg-slate-900 border border-white/10 rounded-xl pr-12 pl-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-left"
                dir="ltr"
                disabled={isScanning}
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !pageUrl.trim()}
              className="h-13 px-7 py-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
            >
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isScanning ? "جاري الفحص..." : "ابدأ الفحص"}
            </button>
          </div>
        </form>

        {/* Loading */}
        {isScanning && (
          <div className="bg-slate-900/80 border border-purple-500/20 rounded-2xl p-8 mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-5 animate-pulse">
              <span className="text-3xl">👻</span>
            </div>
            <p className="text-white font-semibold mb-2">الشبح يتجسس الآن...</p>
            <p className="text-purple-400 text-sm mb-6">{LOADING_STAGES[loadingStage]?.label}</p>
            <div className="space-y-2 max-w-sm mx-auto">
              {LOADING_STAGES.map((stage, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= loadingStage ? "text-white" : "text-slate-600"}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i < loadingStage ? "bg-purple-400" : i === loadingStage ? "bg-purple-400 animate-pulse" : "bg-slate-700"}`} />
                  {stage.label}
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-xs mt-6">قد يستغرق حتى دقيقتين</p>
          </div>
        )}

        {/* Error */}
        {error && (
          error === "QUOTA_EXCEEDED" ? (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                  🔋
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">نفد رصيد Apify الشهري</h3>
                  <p className="text-amber-400 text-sm mb-4">
                    استُهلك رصيد الـ $5 المجاني لهذا الشهر من كثرة الفحوصات.
                  </p>
                  <div className="grid grid-cols-1 gap-3 mb-5">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm font-semibold mb-2">🔄 الحل السريع (مجاني)</p>
                      <p className="text-slate-400 text-sm">ينتجدد الرصيد تلقائياً في بداية الشهر القادم</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm font-semibold mb-2">⚡ رفع الرصيد الآن</p>
                      <p className="text-slate-400 text-sm mb-2">أضف رصيداً من لوحة Apify لمتابعة الفحوصات فوراً</p>
                      <a
                        href="https://console.apify.com/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        فتح لوحة Apify Billing
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => { setError(""); setPageUrl(""); }}
                    className="text-sm text-slate-400 hover:text-white underline transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )
        )}


        {/* Results */}
        {result && !isScanning && (
          <div>
            {/* Stats Bar */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-white font-bold text-lg">{result.pageName || result.pageUrl}</h2>
                  <p className="text-slate-500 text-sm">{result.pageUrl}</p>
                </div>
                {result.isOrganicFallback ? (
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-400">{result.ads.length}</div>
                      <div className="text-xs text-slate-500">منشور عضوي</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full font-medium">📝 لا إعلانات مدفوعة — عرض آخر المنشورات</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">{result.totalAds}</div>
                      <div className="text-xs text-slate-500">إجمالي الإعلانات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-400">{result.activeAds}</div>
                      <div className="text-xs text-slate-500">نشطة الآن</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-orange-400">{result.totalAds - result.activeAds}</div>
                      <div className="text-xs text-slate-500">منتهية</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPageUrl(""); setResult(null); setReport(""); }}
                    className="h-9 px-4 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> فحص جديد
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="h-9 px-5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 text-sm"
                  >
                    {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
                    {isAnalyzing ? "جاري التحليل..." : result.isOrganicFallback ? "تحليل AI للمنشورات" : "تحليل AI للإعلانات"}
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            {(result.ads.length > 0 || report) && (
              <div className="flex border-b border-white/10 mb-6 gap-1">
                <button
                  onClick={() => setActiveTab("ads")}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all ${activeTab === "ads" ? "text-white bg-slate-900 border-t border-x border-white/10" : "text-slate-500 hover:text-white"}`}
                >
                  {result.isOrganicFallback ? `📝 المنشورات (${result.ads.length})` : `📋 الإعلانات (${result.ads.length})`}
                </button>
                {(report || isAnalyzing) && (
                  <button
                    onClick={() => setActiveTab("report")}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-all flex items-center gap-2 ${activeTab === "report" ? "text-white bg-slate-900 border-t border-x border-white/10" : "text-slate-500 hover:text-white"}`}
                  >
                    🤖 تقرير AI {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
                  </button>
                )}
              </div>
            )}

            {/* Ads Tab */}
            {activeTab === "ads" && (
              <div className="space-y-4">
                {result.ads.length === 0 ? (
                  <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-8">
                    <div className="flex items-start gap-5">
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                        📭
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">هذه الصفحة لا تملك إعلانات مدفوعة</h3>
                        <p className="text-amber-400 text-sm mb-4">
                          {result.adStatus || result.noAdsReason || "لا توجد إعلانات نشطة في مكتبة Facebook حالياً"}
                        </p>

                        {result.pageInfo && (
                          <div className="grid grid-cols-2 gap-3 mb-5">
                            {result.pageInfo.page_id && (
                              <div className="bg-slate-800/50 rounded-lg p-3">
                                <div className="text-xs text-slate-500 mb-1">معرّف الصفحة</div>
                                <div className="text-sm text-white font-mono">{result.pageInfo.page_id}</div>
                              </div>
                            )}
                            {result.pageInfo.creation_date && (
                              <div className="bg-slate-800/50 rounded-lg p-3">
                                <div className="text-xs text-slate-500 mb-1">تاريخ إنشاء الصفحة</div>
                                <div className="text-sm text-white">{result.pageInfo.creation_date}</div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-4 mb-4">
                          <p className="text-indigo-300 text-sm font-semibold mb-1">💡 هذا يعني فرصة ذهبية!</p>
                          <p className="text-slate-400 text-sm">
                            الصفحة لا تستثمر في الإعلانات المدفوعة. يمكن تحليل هذا الوضع بالذكاء الاصطناعي لفهم التأثير وتقديم توصيات.
                          </p>
                        </div>

                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="flex items-center gap-2 h-10 px-6 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-all text-sm"
                        >
                          {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                          {isAnalyzing ? "جاري التحليل..." : "حلّل هذا الوضع بالذكاء الاصطناعي"}
                        </button>
                      </div>
                    </div>
                  </div>

                ) : (
                  result.ads.map((ad, i) => (
                    <div key={ad.adId || i} className="bg-slate-900 border border-white/8 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                      <div className="flex items-start gap-4">
                        {/* Media Preview */}
                        {(ad.imageUrl || ad.videoUrl) ? (
                          <div className="shrink-0 w-20 h-20 rounded-lg bg-slate-800 overflow-hidden relative">
                            {ad.videoUrl ? (
                              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                <Play className="w-8 h-8 text-purple-400" />
                              </div>
                            ) : (
                              <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            )}
                          </div>
                        ) : (
                          <div className="shrink-0 w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center">
                            <ImageIcon className="w-7 h-7 text-slate-600" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {result.isOrganicFallback ? (
                              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                📝 منشور عضوي
                              </span>
                            ) : (
                              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ad.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-700 text-slate-400"}`}>
                                {ad.isActive ? <><CheckCircle className="w-3 h-3" /> نشط</> : <><XCircle className="w-3 h-3" /> منتهي</>}
                              </span>
                            )}

                            {ad.videoUrl && <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">🎬 فيديو</span>}
                            {ad.imageUrl && !ad.videoUrl && <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">📷 صورة</span>}
                            {ad.startDate && <span className="text-xs text-slate-500">{new Date(ad.startDate).toLocaleDateString("ar")}</span>}
                          </div>

                          <p className="text-slate-200 text-sm leading-relaxed line-clamp-3">
                            {ad.adText || <span className="text-slate-600">(منشور بدون نص)</span>}
                          </p>

                          {/* Organic post stats */}
                          {result.isOrganicFallback && ((ad as any).likes !== undefined) && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>❤️ {(ad as any).likes?.toLocaleString()}</span>
                              <span>💬 {(ad as any).comments?.toLocaleString()}</span>
                              <span>↗️ {(ad as any).shares?.toLocaleString()}</span>
                            </div>
                          )}

                          {ad.ctaText && (
                            <div className="mt-2">
                              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                زر CTA: {ad.ctaText}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* AI Report Tab */}
            {activeTab === "report" && (
              <div>
                {isAnalyzing ? (
                  <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-12 text-center">
                    <Brain className="w-12 h-12 text-indigo-400 animate-pulse mx-auto mb-4" />
                    <p className="text-white font-semibold mb-1">الذكاء الاصطناعي يحلل الإعلانات...</p>
                    <p className="text-slate-500 text-sm">يستغرق 15-30 ثانية</p>
                  </div>
                ) : report ? (
                  <div className="bg-slate-900 border border-white/10 rounded-2xl p-7">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <ScanSearch className="w-5 h-5 text-indigo-400" />
                        <h3 className="font-bold text-white">التقرير الاستراتيجي الكامل</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                          {reportSource === "gemini" ? "✨ Gemini AI" : "⚡ Groq AI"} • {result.ads.length} إعلان
                        </span>
                        <button onClick={copyReport} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all">
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "تم النسخ" : "نسخ"}
                        </button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-[15px] text-slate-200">
                      {report}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
