"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Loader2, Save, Copy, Check, MessageSquare, Target, Camera, Globe, MessageCircle, Briefcase, Users, Star, TrendingUp, ChevronDown, ChevronUp, Zap } from 'lucide-react';

interface ContentVariant {
  title: string;
  body: string;
  platform: string;
  saved?: boolean;
}

interface ExpertScore {
  score: number;
  note: string;
}

interface PanelResult {
  finalScore: number;
  rounds: number;
  improvedText: string;
  originalText: string;
  panelScores: Record<string, ExpertScore>;
  topWeaknesses: string;
  passed: boolean;
}

const SCORE_COLOR = (score: number) => {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  return "text-red-400";
};

const SCORE_BG = (score: number) => {
  if (score >= 85) return "bg-green-500/10 border-green-500/30";
  if (score >= 70) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
};

export default function ForgeClient() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("احترافي");
  const [audience, setAudience] = useState("");
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const t = searchParams.get('topic');
    if (t) {
      setTopic(`أعد صياغة إعلان المنافس التالي ليكون أقوى بنسبة 10 أضعاف وخاص بشركتي:\n\n"${t}"`);
      setTone("حماسي/عاجل");
    }
  }, [searchParams]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ContentVariant[]>([]);
  const [errorObj, setErrorObj] = useState("");

  // Expert Panel State
  const [evaluatingIndex, setEvaluatingIndex] = useState<number | null>(null);
  const [panelResults, setPanelResults] = useState<Record<number, PanelResult>>({});
  const [expandedPanel, setExpandedPanel] = useState<number | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    setIsGenerating(true);
    setErrorObj("");
    setResults([]);
    setPanelResults({});

    try {
      const res = await fetch("/api/forge/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, tone, audience, useMock })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.ideas);
      } else {
        setErrorObj(data.error);
      }
    } catch (err) {
      setErrorObj("حدث خطأ في الاتصال بالخادم.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 🧠 Expert Panel Evaluation
  const handleExpertPanel = async (variant: ContentVariant, index: number) => {
    setEvaluatingIndex(index);
    setExpandedPanel(index);
    try {
      const res = await fetch("/api/forge/expert-panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: variant.body, contentType: "ad" })
      });
      const data = await res.json();
      if (data.success) {
        setPanelResults(prev => ({ ...prev, [index]: data }));
      }
    } catch (err) {
      console.error("Expert Panel Error:", err);
    } finally {
      setEvaluatingIndex(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = async (variant: ContentVariant, index: number) => {
    try {
      const res = await fetch("/api/forge/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: variant.title, content: variant.body, platform: variant.platform })
      });
      const data = await res.json();
      if (data.success) {
        const newResults = [...results];
        newResults[index].saved = true;
        setResults(newResults);
      } else {
        alert("فشل الحفظ: " + data.error);
      }
    } catch (err) {
      alert("تعذر الحفظ.");
    }
  };

  const platforms = [
    { name: "Instagram", icon: <Camera className="w-4 h-4" /> },
    { name: "Facebook", icon: <Globe className="w-4 h-4" /> },
    { name: "Twitter", icon: <MessageCircle className="w-4 h-4" /> },
    { name: "LinkedIn", icon: <Briefcase className="w-4 h-4" /> },
  ];

  const tones = ["احترافي", "حماسي/عاجل", "عاطفي مؤثر", "كوميدي", "غامض ومثير"];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-16">
      
      {/* CONTROL PANEL (LEFT) */}
      <div className="w-full lg:w-1/3 bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl flex flex-col h-max">
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles className="text-orange-500 w-5 h-5" /> لوحة التحكم بالمصنع
        </h2>
        <p className="text-xs text-gray-500 mb-6">مدعوم بـ Expert Panel من ai-marketing-skills</p>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">موضوع المحتوى / المنتج</label>
            <textarea 
              value={topic} onChange={e => setTopic(e.target.value)} required
              placeholder="مثال: إطلاق خدمة تبييض أسنان جديدة بخصم 50% لفترة محدودة..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600 min-h-[120px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 flex items-center gap-1"><Target className="w-4 h-4"/> الجمهور المستهدف (اختياري)</label>
            <input 
              type="text" value={audience} onChange={e => setAudience(e.target.value)}
              placeholder="مثال: الشباب، الأمهات الجدد، أصحاب الشركات..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl h-12 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-400 mb-2">المنصة المستهدفة</label>
             <div className="grid grid-cols-2 gap-2">
               {platforms.map(p => (
                 <button key={p.name} type="button" onClick={() => setPlatform(p.name)}
                   className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-all ${platform === p.name ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'}`}
                 >
                   {p.icon} {p.name}
                 </button>
               ))}
             </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 mt-4">أسلوب الكتابة (Tone)</label>
            <div className="flex flex-wrap gap-2">
              {tones.map(t => (
                 <button key={t} type="button" onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${tone === t ? 'bg-orange-500/10 text-orange-400 border-orange-500/50' : 'bg-transparent border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600'}`}
                 >
                   {t}
                 </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" disabled={isGenerating || !topic}
            className="w-full h-14 mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-red-900/40 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {isGenerating ? 'جاري صهر الأفكار...' : 'توليد المحتوى الآن'}
          </button>

          {errorObj && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900 rounded-lg mt-4">
              {errorObj}
            </div>
          )}

        </form>

        {/* Expert Panel Info Box */}
        <div className="mt-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-bold text-purple-300">Expert Panel AI</span>
            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">9 خبراء</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            بعد توليد المحتوى، اضغط <strong className="text-purple-300">«تقييم الخبراء»</strong> ليُحسّن 9 خبراء AI إعلانك تلقائياً حتى يصل لـ <strong className="text-green-400">85+/100</strong>.
          </p>
        </div>
      </div>

      {/* CANVAS DISPLAY (RIGHT) */}
      <div className="w-full lg:w-2/3 flex flex-col">
        {!isGenerating && results.length === 0 && (
          <div className="flex-1 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
             <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
             <h3 className="text-xl font-bold">المصنع بانتظار أوامرك</h3>
             <p className="mt-2 text-sm text-center max-w-md">قم بوصف فكرتك أو منتجك في لوحة التحكم للحصول على ٣ صياغات إبداعية مختلفة، ثم قيّمها بـ Expert Panel.</p>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 border-2 border-dashed border-orange-900/30 rounded-3xl flex flex-col items-center justify-center py-32 text-orange-600/50">
             <div className="relative">
               <Sparkles className="w-16 h-16 mb-6 animate-pulse" />
               <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-spin rounded-full" />
             </div>
             <p className="font-bold text-lg animate-pulse text-orange-400">يجري تصنيع المحتوى بحرارة عالية... 🔥</p>
          </div>
        )}

        {!isGenerating && results.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
            {results.map((variant, index) => {
              const panel = panelResults[index];
              const isEvaluating = evaluatingIndex === index;
              const isExpanded = expandedPanel === index;

              return (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all hover:border-orange-500/20">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      <span className="text-orange-500">#{index + 1}</span> {variant.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400 font-bold">{variant.platform}</span>
                      {panel && (
                        <span className={`text-xs font-black px-2 py-1 rounded-full border ${SCORE_BG(panel.finalScore)} ${SCORE_COLOR(panel.finalScore)}`}>
                          {panel.finalScore}/100
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Original Text */}
                  <div className="p-5">
                    <div className="text-gray-200 text-sm leading-8 whitespace-pre-wrap font-medium">
                      {panel ? panel.originalText : variant.body}
                    </div>
                  </div>

                  {/* Expert Panel Result */}
                  {panel && (
                    <div className={`mx-5 mb-4 rounded-xl border p-4 ${SCORE_BG(panel.finalScore)}`}>
                      
                      {/* Score Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Star className={`w-5 h-5 ${SCORE_COLOR(panel.finalScore)}`} />
                          <span className={`font-black text-lg ${SCORE_COLOR(panel.finalScore)}`}>
                            {panel.finalScore}/100
                          </span>
                          <span className="text-xs text-gray-400">({panel.rounds} {panel.rounds === 1 ? "جولة" : "جولات"})</span>
                          {panel.passed && <span className="text-xs bg-green-600/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">✅ اجتاز المعيار</span>}
                        </div>
                        <button onClick={() => setExpandedPanel(isExpanded ? null : index)} className="text-gray-500 hover:text-gray-300 transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expert Scores Grid */}
                      {isExpanded && (
                        <div className="space-y-3 mb-4">
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(panel.panelScores).map(([expert, data]) => (
                              <div key={expert} className="flex items-start gap-3 bg-black/20 rounded-lg p-2">
                                <span className={`text-sm font-black min-w-[36px] text-center ${SCORE_COLOR(data.score)}`}>{data.score}</span>
                                <div>
                                  <div className="text-xs font-bold text-gray-300">{expert}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{data.note}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {panel.topWeaknesses && (
                            <div className="bg-red-900/10 border border-red-500/20 p-3 rounded-lg">
                              <div className="text-xs font-bold text-red-400 mb-1">⚠️ نقاط الضعف المُعالَجة:</div>
                              <div className="text-xs text-gray-400 whitespace-pre-wrap">{panel.topWeaknesses}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Improved Text */}
                      {panel.improvedText !== panel.originalText && (
                        <div className="bg-green-900/10 border border-green-500/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-bold text-green-400">النص المحسّن بواسطة الخبراء:</span>
                          </div>
                          <div className="text-sm text-gray-200 leading-7 whitespace-pre-wrap">{panel.improvedText}</div>
                          <button
                            onClick={() => handleCopy(panel.improvedText)}
                            className="mt-2 flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Copy className="w-3 h-3" /> نسخ النص المحسّن
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 p-5 pt-0">
                    {/* Expert Panel Button */}
                    <button
                      onClick={() => handleExpertPanel(variant, index)}
                      disabled={isEvaluating || !!panel}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        panel 
                          ? 'bg-purple-900/20 text-purple-400 border border-purple-500/30 cursor-default' 
                          : 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-300 border border-purple-500/40 hover:border-purple-400/60'
                      } disabled:opacity-60`}
                    >
                      {isEvaluating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> جاري تقييم الخبراء...</>
                      ) : panel ? (
                        <><Star className="w-4 h-4" /> تم التقييم ✅</>
                      ) : (
                        <><Users className="w-4 h-4" /> تقييم الخبراء (9 خبراء AI)</>
                      )}
                    </button>

                    <button onClick={() => handleSave(variant, index)} disabled={variant.saved}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${variant.saved ? 'bg-green-900/20 text-green-500 border border-green-900/50' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                    >
                      {variant.saved ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4" />}
                      {variant.saved ? 'محفوظ' : 'حفظ'}
                    </button>

                    <button onClick={() => handleCopy(variant.body)} 
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white font-bold text-sm transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      نسخ
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
