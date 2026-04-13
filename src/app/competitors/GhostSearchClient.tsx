"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, LayoutGrid, List, Filter, TrendingUp, Ghost, Globe, ThumbsUp, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdCard from './AdCard';
import { analyzeAdsBatch } from '@/services/ghost/ad-analyzer';

export default function GhostSearchClient({ initialCompetitors, hasToken }: { initialCompetitors: any[], hasToken: boolean }) {
  const router = useRouter();
  const [pageUrl, setPageUrl] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [competitors, setCompetitors] = useState<any[]>(initialCompetitors || []);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('ALL');
  const [sortOpts, setSortOpts] = useState('newest');

  // Active competitor is the most recently scraped one
  const activeCompetitor = competitors && competitors.length > 0 ? competitors[0] : null;
  const ads = activeCompetitor?.ads || [];

  // Fetch fresh data from API
  const refreshCompetitors = async () => {
    try {
      const res = await fetch("/api/ghost/sync");
      const data = await res.json();
      if (data.success && data.competitors) {
        setCompetitors(data.competitors);
      }
    } catch (err) {
      console.error("Failed to refresh competitors:", err);
    }
  };

  const handleSearch = async (e?: React.FormEvent, directUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = directUrl || pageUrl;
    if (!targetUrl) return;

    if (targetUrl.includes('/share/')) {
      setMessage("❌ عذراً! هذا رابط (مشاركة منشور). ضع رابط (صفحة الشركة) الرئيسية لتسحب إعلاناتها.");
      return;
    }

    setIsSearching(true);
    setMessage(hasToken ? "جاري تجهيز الشبح للاختراق... 👻" : "جاري تشغيل الشبح (الوضع الوهمي)... 👻");

    try {
      const res = await fetch("/api/ghost/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: targetUrl })
      });
      const data = await res.json();
      
      if (data.success && data.runId) {
        setMessage(`تم إطلاق الشبح للبحث في مكتبة إعلانات: ${targetUrl}. يرجى الانتظار...`);
        setPageUrl(targetUrl);
        await pollGhostStatus(data.runId, targetUrl);
      } else {
        setMessage("عذراً، الشبح فشل في الانطلاق.");
        setIsSearching(false);
      }
    } catch (error) {
      setMessage("فشل الاتصال بالخادم.");
      setIsSearching(false);
    }
  };

  const pollGhostStatus = async (runId: string, targetUrl: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/ghost/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId, pageUrl: targetUrl })
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(pollInterval);
          setMessage("✅ " + data.message);
          setIsSearching(false);
          // Fetch fresh data directly instead of relying on router.refresh()
          await refreshCompetitors();
        } else {
          setMessage(`الشبح يقرأ البيانات... الحالة: ${data.status || 'RUNNING'} 👻`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  const batchAnalysis = analyzeAdsBatch(ads);

  // Deep Scan State
  const [isDeepScanning, setIsDeepScanning] = useState(false);
  const [ghostReport, setGhostReport] = useState<any>(null);
  const [scanSteps, setScanSteps] = useState<string[]>([]);
  
  const handleDeepScan = async () => {
     if (!activeCompetitor) return;
     setIsDeepScanning(true);
     setScanSteps(["جاري تحليل الإعلانات...", "قراءة المحتوى الإبداعي...", "استخراج الكلمات المفتاحية..."]);
     
     // Simulate terminal steps effect
     let stepIndex = 0;
     const interval = setInterval(() => {
        stepIndex++;
        if(stepIndex === 1) setScanSteps(prev => [...prev, "تقييم أداء الحملات (SEO)..."]);
        if(stepIndex === 2) setScanSteps(prev => [...prev, "توجيه Gemini لصياغة استراتيجية تسويقية..."]);
        if(stepIndex > 2) clearInterval(interval);
     }, 1500);

     try {
       const res = await fetch("/api/ghost/deep-scan", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ competitorId: activeCompetitor.id })
       });
       const data = await res.json();
       clearInterval(interval);
       if (data.success) {
         setScanSteps(prev => [...prev, "✅ تم إعداد التقرير التسويقي بنجاح!"]);
         setTimeout(() => { setIsDeepScanning(false); setGhostReport(data.report); }, 1500);
       } else {
         setIsDeepScanning(false);
         alert("فشل الفحص العميق!");
       }
     } catch (err) {
       clearInterval(interval);
       setIsDeepScanning(false);
       alert("تعذر الاتصال بقاعدة GHOST.");
     }
  };

  // Filter & Sort
  let displayAds = [...ads];
  if (filter === 'ACTIVE') displayAds = displayAds.filter(a => a.isActive);
  if (filter === 'INACTIVE') displayAds = displayAds.filter(a => !a.isActive);
  if (filter === 'OFFER') displayAds = displayAds.filter(a => a.hasOffer);
  if (filter === 'VIDEO') displayAds = displayAds.filter(a => !!a.videoUrl);

  if (sortOpts === 'hook') displayAds.sort((a, b) => (b.hookScore || 0) - (a.hookScore || 0));
  if (sortOpts === 'newest') displayAds.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Search Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full space-y-4">
            <div>
              <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-1">حدد هدفك</p>
              <h2 className="text-2xl font-bold text-white">إطلاق الشبح 👻</h2>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" value={pageUrl} onChange={e => setPageUrl(e.target.value)}
                placeholder="أدخل رابط صفحة المنافس (Facebook / Instagram)..."
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl h-14 px-5 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
              />
              <button 
                type="submit" disabled={isSearching}
                className="h-14 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/50 transition-all active:scale-95 disabled:opacity-50 min-w-[160px]"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Ghost className="w-5 h-5" />}
                <span>{isSearching ? "جاري التجسس..." : "بدء التجسس"}</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-500">روابط سريعة للتجربة:</span>
              <button type="button" onClick={() => handleSearch(undefined, 'https://facebook.com/Apple')} className="text-purple-400 hover:underline">Apple</button>
              <button type="button" onClick={() => handleSearch(undefined, 'https://facebook.com/Nike')} className="text-purple-400 hover:underline">Nike</button>
            </div>
            
            {message && (
              <div 
                onClick={() => {
                  if (message.includes('بنجاح')) {
                    document.getElementById('ads-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`mt-4 px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${message.includes('بنجاح') ? 'cursor-pointer hover:bg-purple-900/40 hover:shadow-lg hover:shadow-purple-900/20 active:scale-[0.98] ring-1 ring-purple-500/50 hover:ring-purple-400' : ''} ${message.includes('❌') || message.includes('فشل') ? 'bg-red-900/20 text-red-400 border border-red-900/50' : 'bg-purple-900/20 text-purple-300 border border-purple-800/50'}`}
                title={message.includes('بنجاح') ? "اضغط هنا للانتقال للإعلانات" : ""}
              >
                {isSearching ? <Ghost className="w-4 h-4 animate-bounce text-purple-400" /> : message.includes('بنجاح') ? <span className="animate-pulse">✨</span> : null}
                <span className="flex-1">{message}</span>
                {message.includes('بنجاح') && <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full animate-bounce">اضغط للعرض 👇</span>}
              </div>
            )}
            {!hasToken && !isSearching && (
              <div className="mt-2 text-xs text-yellow-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> يعمل التجسس حالياً بوضع الطيران الآلي الوهمي للواجهة فقط.
              </div>
            )}
          </div>
        </div>
      </div>

      {isSearching && !activeCompetitor && (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
           <div className="relative">
             <Ghost className="w-16 h-16 text-purple-600 animate-bounce" />
             <div className="absolute inset-0 bg-purple-600 blur-xl opacity-30 animate-pulse rounded-full" />
           </div>
           <p className="font-bold text-lg text-purple-400">الشبح يتسلق جدران مكتبة فيسبوك...</p>
         </div>
      )}

      {/* Competitor Dashboard */}
      {!isSearching && activeCompetitor && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          {/* Competitor Top Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex flex-col gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full md:w-1/3 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-xl shadow-purple-900/30 font-bold border-2 border-gray-800 shrink-0">
                   {activeCompetitor.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-xl text-white flex items-center gap-2 truncate">
                    {activeCompetitor.name}
                    {activeCompetitor.platform === 'facebook' && <Globe className="w-4 h-4 text-blue-500 shrink-0" />}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                     <div>اكتشفنا {activeCompetitor.totalAdsFound} إعلان</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleDeepScan}
                disabled={isDeepScanning}
                className="mt-2 w-full py-2.5 bg-purple-600/10 border border-purple-500/50 hover:bg-purple-600/20 text-purple-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isDeepScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>📊</span>}
                {isDeepScanning ? "جارِ التحليل التسويقي..." : "تحليل تسويقي عميق (AI Analysis)"}
              </button>
            </div>

            {/* AI Analysis Cards OR Loading Terminal OR Report */}
            {isDeepScanning ? (
              <div className="bg-gray-950 border border-purple-500/30 rounded-2xl p-6 w-full md:w-2/3 shadow-lg relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                 <div className="text-purple-400 text-xs mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div> APEX AI Marketing Analyzer</div>
                 <div className="space-y-2 text-sm text-purple-300/80">
                   {scanSteps.map((step, i) => (
                     <div key={i} className="animate-in slide-in-from-left-4 duration-300 flex items-center gap-2"><span className="text-purple-500">●</span> {step}</div>
                   ))}
                 </div>
              </div>
            ) : ghostReport ? (
              <div className="bg-gradient-to-br from-gray-900 to-[#0f0f1a] border border-purple-500/30 rounded-2xl p-6 w-full md:w-2/3 shadow-lg shadow-purple-900/20 relative">
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-2">
                       <span className="text-xl">📊</span> تقرير تحليل المنافس (Marketing Report)
                    </h3>
                    <div className="flex gap-3 text-xs font-bold">
                       <span className="bg-gray-800 py-1 px-3 rounded-lg border border-gray-700">SEO: {ghostReport.seoScore}%</span>
                       <span className={`bg-gray-800 py-1 px-3 rounded-lg border border-gray-700 ${ghostReport.websiteSpeed?.includes('بطيء') || ghostReport.websiteSpeed?.includes('Slow') ? 'text-red-400' : 'text-green-400'}`}>{ghostReport.websiteSpeed}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-purple-400 mb-2">📋 نقاط القوة والضعف</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ghostReport.vulnerabilities}</p>
                   </div>
                   <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                      <h4 className="text-sm font-bold text-blue-400 mb-2">🎯 الاستراتيجية المقترحة للتفوق</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ghostReport.attackPlan}</p>
                   </div>
                   <div className="bg-gray-800/50 border border-gray-700/50 p-3 rounded-xl flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">🔑 الكلمات المفتاحية:</span>
                      {ghostReport.topKeywords?.split(',').map((kw: string, i: number) => (
                        <span key={i} className="text-xs bg-purple-600/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">{kw.trim()}</span>
                      ))}
                   </div>
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                 <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                   <div className="text-gray-500 text-xs font-bold uppercase mb-1">متوسط قوة الخطاف (Hook)</div>
                   <div className="text-3xl font-black text-purple-400">{batchAnalysis.avgHookScore} <span className="text-lg text-gray-600">/ 10</span></div>
                 </div>
                 <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                   <div className="text-gray-500 text-xs font-bold uppercase mb-1">تركيز المحتوى (العروض)</div>
                   <div className="text-3xl font-black text-yellow-500">{batchAnalysis.offerCount} <span className="text-lg text-gray-600 text-sm font-normal">إعلانات بيعية</span></div>
                 </div>
                 <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg">
                   <div className="text-gray-500 text-xs font-bold uppercase mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> نصيحة مبدئية</div>
                   <div className="text-sm text-gray-300 leading-snug truncate whitespace-normal">{batchAnalysis.recommendation}</div>
                 </div>
              </div>
            )}
          </div>

          <div id="ads-grid" className="scroll-mt-24"></div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-950/50 p-2 rounded-xl">
            <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800 overflow-x-auto w-full md:w-auto">
              {['ALL', 'ACTIVE', 'INACTIVE', 'OFFER', 'VIDEO'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {f === 'ALL' ? 'الكل' : f === 'ACTIVE' ? 'النشطة فقط' : f === 'INACTIVE' ? 'المتوقفة' : f === 'OFFER' ? 'العروض 💰' : 'الفيديوهات 🎥'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1">
                <Filter className="w-4 h-4 text-gray-500" />
                <select value={sortOpts} onChange={e => setSortOpts(e.target.value)} className="bg-transparent text-sm text-gray-300 outline-none py-1">
                  <option value="newest">ترتيب: الأحدث</option>
                  <option value="hook">ترتيب: أقوى خطاف</option>
                </select>
              </div>

              <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Ads Grid */}
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {displayAds.map((ad: any) => (
               <AdCard key={ad.id || ad.adId || Math.random()} ad={ad} viewMode={viewMode} />
            ))}
          </div>

          {displayAds.length === 0 && (
            <div className="py-20 text-center text-gray-500 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
              <Ghost className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>لا توجد إعلانات مطابقة للبحث أو الفلتر الحالي.</p>
            </div>
          )}

        </div>
      )}

      {!isSearching && !activeCompetitor && (
         <div className="flex flex-col items-center justify-center py-32 text-gray-600">
            <Ghost className="w-24 h-24 mb-6 text-gray-800" />
            <p className="text-xl font-bold">مكتبة المنافسين خالية حالياً.</p>
            <p className="mt-2">أدخل رابط أي منافس بالأعلى لإرسال الشبح للتجسس عليه وجمع كل إعلاناته وحملاته التسويقية!</p>
         </div>
      )}

    </div>
  );
}
