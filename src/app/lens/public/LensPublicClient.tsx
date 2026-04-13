"use client";

import { useState, useEffect } from "react";
import { 
  ScanSearch, User, Building2, Link as LinkIcon, 
  Target, Mail, Phone, UserCircle, ArrowRight,
  CheckCircle2, Loader2, Sparkles, AlertTriangle
} from "lucide-react";

export default function LensPublicClient() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "", // 'individual' or 'company'
    platformUrl: "",
    goals: [] as string[],
    contactInfo: { name: "", email: "", phone: "" }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const goalOptions = [
    "زيادة المبيعات والعملاء المحتملين",
    "زيادة المتابعين والتفاعل",
    "بناء سلطة وموثوقية في مجالي",
    "إطلاق منتج / خدمة جديدة قريباً"
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      const current = prev.goals;
      if (current.includes(goal)) return { ...prev, goals: current.filter(g => g !== goal) };
      if (current.length >= 2) return prev; // max 2
      return { ...prev, goals: [...current, goal] };
    });
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(6); // Processing screen

    try {
      const res = await fetch("/api/lens/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.error || `فشل الطلب: ${res.status} ${res.statusText}`;
        console.error("❌ API Error Response:", errorData);
        console.error("❌ Request Payload:", formData);
        throw new Error(errorMessage);
      }

      const data = await res.json();
      console.log("✅ API Response:", data);

      // Simulate an extra delay so they feel the AI working
      setTimeout(() => {
        setIsAnalyzing(false);
        if (data.success) {
          setAnalysisResult(data);
        } else {
          const errorMsg = data.error || "فشل الذكاء الاصطناعي في تحليل الحساب. يرجى المحاولة مرة أخرى.";
          console.error("❌ Analysis Failed:", errorMsg);
          console.error("❌ Full Response:", data);
          setAnalysisResult({ error: errorMsg });
        }
      }, 3000);

    } catch (e) {
      console.error("❌ Network/Fetch Error:", e);
      console.error("❌ Request Payload:", formData);
      setTimeout(() => {
        setIsAnalyzing(false);
        const errorMessage = e instanceof Error ? e.message : "تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.";
        setAnalysisResult({ error: errorMessage });
      }, 2000);
    }
  };

  // UI Components per step
  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.3)] mb-4">
        <ScanSearch className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
        اكتشف لماذا لا <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">تنمو</span> حساباتك بالسرعة الكافية
      </h1>
      <p className="text-lg text-slate-400 mx-auto max-w-xl">
        استخدم الذكاء الاصطناعي لفحص حساباتك واكتشاف نقاط الضعف وتسريب العملاء وتلقي خطة نمو في 45 ثانية فقط.
      </p>
      
      <button 
        onClick={() => setStep(2)}
        className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-10 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
      >
        <span className="mr-2">ابدأ الفحص المجاني الآن</span>
        <ArrowRight className="w-4 h-4 ml-2 group-hover:-translate-x-1 transition-transform rotate-180" />
      </button>

      <div className="flex items-center gap-2 mt-8 text-sm text-slate-500 bg-white/5 py-2 px-6 rounded-full border border-white/5">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> تمت تجربة الأداة بواسطة 1,420+ براند
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-3">هل نقوم بتحليل علامة شخصية أم شركة؟</h2>
      <p className="text-slate-400 mb-10">هذا سيساعد محرك الذكاء الاصطناعي على تكييف التحليل بدقة لاحتياجاتك.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <button 
          onClick={() => { setFormData({...formData, type: 'individual'}); setStep(3); }}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-800/80 hover:border-teal-500/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
            <User className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
          </div>
          <div>
            <div className="text-white font-bold text-lg mb-1">علامة شخصية</div>
            <div className="text-xs text-slate-500">صناع المحتوى والمستقلين</div>
          </div>
        </button>

        <button 
          onClick={() => { setFormData({...formData, type: 'company'}); setStep(3); }}
          className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-800/80 hover:border-teal-500/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
            <Building2 className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
          </div>
          <div>
            <div className="text-white font-bold text-lg mb-1">شركة / مؤسسة</div>
            <div className="text-xs text-slate-500">مشاريع وعلامات تجارية</div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-3">ما هو الحساب الذي تريد فحصه؟</h2>
      <p className="text-slate-400 mb-10">ضع رابط إنستجرام، تيك توك، أو منصة إكس.</p>
      
      <div className="relative mb-6 text-right">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">رابط الحساب (URL)</label>
        <div className="relative">
          <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="url" 
            placeholder="مثال: instagram.com/username" 
            value={formData.platformUrl}
            onChange={(e) => setFormData({...formData, platformUrl: e.target.value})}
            className="w-full h-14 bg-slate-900 border border-white/10 rounded-xl px-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-left"
            dir="ltr"
          />
        </div>
      </div>

      <button 
        disabled={!formData.platformUrl}
        onClick={() => setStep(4)}
        className="h-14 w-full rounded-xl bg-teal-500 text-white font-bold transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        المتابعة للاستمرار &larr;
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-3">ما هي أبرز التحديات أو الأهداف لك؟</h2>
      <p className="text-slate-400 mb-8">اختر ما يصل إلى هدفين للتركيز عليهما في التحليل.</p>
      
      <div className="space-y-3 mb-8">
        {goalOptions.map(goal => {
          const isSelected = formData.goals.includes(goal);
          const isDisabled = formData.goals.length >= 2 && !isSelected;
          return (
            <button
              key={goal}
              disabled={isDisabled}
              onClick={() => handleGoalToggle(goal)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isSelected 
                  ? "bg-teal-500/10 border-teal-500/50 text-teal-300" 
                  : "bg-slate-900 border-white/5 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className={`w-5 h-5 ${isSelected ? "text-teal-400" : "text-slate-500"}`} />
                <span className="font-medium text-sm">{goal}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-teal-500 bg-teal-500" : "border-slate-600"}`}>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <button 
        disabled={formData.goals.length === 0}
        onClick={() => setStep(5)}
        className="h-14 w-full rounded-xl bg-teal-500 text-white font-bold transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        الخطوة الأخيرة <ArrowRight className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">لمن نرسل التقرير النهائي؟</h2>
      <p className="text-slate-400 mb-8">سيبدأ تحليل الذكاء الاصطناعي الآن. أدخل بياناتك للحصول على التقرير الكامل وخطة العمل.</p>
      
      <div className="space-y-4 mb-8 text-right">
        <div className="relative">
          <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="الاسم الكامل" 
            value={formData.contactInfo.name}
            onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, name: e.target.value}})}
            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl pr-12 pl-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="email" 
            placeholder="البريد الإلكتروني للعمل" 
            value={formData.contactInfo.email}
            onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}
            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl pr-12 pl-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="tel" 
            placeholder="رقم الواتساب (اختياري، لإرسال التنبيهات)" 
            value={formData.contactInfo.phone}
            onChange={(e) => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}
            className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl pr-12 pl-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            dir="ltr"
          />
        </div>
      </div>

      <button 
        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
        onClick={startAnalysis}
        className="h-14 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        <ScanSearch className="w-5 h-5" /> بدء الفحص المتعمق
      </button>
    </div>
  );

  const renderStep6 = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in">
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 blur-sm animate-pulse" />
            <div className="w-24 h-24 rounded-full border-4 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent animate-spin flex items-center justify-center bg-slate-900">
              <ScanSearch className="w-8 h-8 text-indigo-400 rotate-90" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">LENS يقرأ حساباتك الآن...</h2>
          <p className="text-slate-400 animate-pulse">جاري سحب البيانات وبناء الاستراتيجية خصيصاً لك.</p>
        </div>
      );
    }

    if (analysisResult?.error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-400">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <p>{analysisResult.error}</p>
          <button onClick={() => setStep(5)} className="mt-6 px-6 py-2 bg-slate-800 rounded-lg text-white">إعادة المحاولة</button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 text-right">
        
        {/* Success Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 mb-8 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-1">اكتمل التقرير بنجاح!</h2>
          <p className="text-slate-300">تم إرسال نسخة مبدئية لبريدك. إليك المقتطفات الأساسية للتحليل:</p>
        </div>

        {/* Real Data Scraped */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">المتابعين المقدرين</div>
            <div className="text-xl font-black text-white">{analysisResult?.scrapedData?.followers?.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">التفاعل المتوقع</div>
            <div className="text-xl font-black text-white">{analysisResult?.scrapedData?.engagementRate}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5 col-span-2">
            <div className="text-xs text-slate-500 mb-1">حالة البايو</div>
            <div className="text-sm font-medium text-amber-400">{analysisResult?.scrapedData?.bioQuality}</div>
          </div>
        </div>

        {/* The Report */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 mb-8 prose prose-invert prose-teal max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-[15px]">{analysisResult?.report}</div>
        </div>

        {/* Upsell / Agency CTA */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500 text-[10px] font-bold text-white tracking-widest rounded-bl-lg">خطوتك التالية</div>
          <div className="p-8 sm:flex items-center justify-between gap-6">
            <div className="mb-6 sm:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">أتريد أن نقوم بتنفيذ هذه الخطة لك؟</h3>
              <p className="text-sm text-slate-400 max-w-sm">لدينا فريق من خبراء التسويق مستعد لتنفيذ هذه الاستراتيجية بدقة وزيادة إيراداتك. احجز مكالمة استشارية مجانية لمناقشة التفاصيل.</p>
            </div>
            <button className="whitespace-nowrap shrink-0 h-12 px-6 rounded-xl bg-white text-indigo-900 font-bold hover:bg-slate-100 transition-colors">
              حجز استشارة مجانية
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-sans overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            LENS <span className="text-sm font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden sm:block">Powered by APEX Agency</span>
          </span>
        </div>
        <div className="text-xs font-medium text-slate-500 pb-1 border-b border-dashed border-slate-700">عربي</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 120px)'}}>
        
        {/* Progress Bar */}
        {step > 1 && step < 6 && (
          <div className="max-w-xl w-full flex items-center gap-2 mb-12 animate-in fade-in">
            {[2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-teal-500" : "bg-slate-800"}`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Step Rendering */}
        <div className="w-full">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
        </div>

      </div>
    </div>
  );
}
