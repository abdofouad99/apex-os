"use client";

import { useState } from "react";
import {
  ScanSearch, User, Building2, Link as LinkIcon,
  Target, Mail, Phone, UserCircle, ArrowRight,
  CheckCircle2, Loader2, Sparkles, AlertTriangle,
  Users, Heart, MessageCircle, Eye, TrendingUp,
  Shield, Zap, BookOpen, Calendar, Copy, Check,
  BadgeCheck, ExternalLink, BarChart3
} from "lucide-react";
import LensReportDisplay from "./LensReportDisplay";

export default function LensPublicClient() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "",
    platformUrl: "",
    goals: [] as string[],
    contactInfo: { name: "", email: "", phone: "" }
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  const goalOptions = [
    "زيادة المبيعات والعملاء المحتملين",
    "زيادة المتابعين والتفاعل",
    "بناء سلطة وموثوقية في مجالي",
    "إطلاق منتج / خدمة جديدة قريباً"
  ];

  const loadingStages = [
    "جاري الاتصال بمنصة السوشيال ميديا...",
    "استخراج بيانات الحساب الحقيقية...",
    "تحليل آخر المنشورات وأداؤها...",
    "حساب معدلات التفاعل الحقيقية...",
    "تشغيل محرك الذكاء الاصطناعي...",
    "إعداد التقرير التشخيصي الكامل...",
  ];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      const current = prev.goals;
      if (current.includes(goal)) return { ...prev, goals: current.filter(g => g !== goal) };
      if (current.length >= 2) return prev;
      return { ...prev, goals: [...current, goal] };
    });
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep(6);
    setLoadingStage(0);

    // Advance loading stages
    const stageInterval = setInterval(() => {
      setLoadingStage(prev => {
        if (prev < loadingStages.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, 15000);

    try {
      const res = await fetch("/api/lens/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      clearInterval(stageInterval);
      setLoadingStage(loadingStages.length - 1);

      const data = await res.json();

      setTimeout(() => {
        setIsAnalyzing(false);
        if (data.success) {
          setAnalysisResult(data);
        } else {
          setAnalysisResult({ error: data.error || "فشل التحليل" });
        }
      }, 1500);

    } catch (e: any) {
      clearInterval(stageInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisResult({ error: e.message || "تعذر الاتصال بالخادم" });
      }, 1000);
    }
  };

  const copyReport = () => {
    if (analysisResult?.report) {
      navigator.clipboard.writeText(analysisResult.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sd = analysisResult?.scrapedData;

  // ── Steps ──
  const renderStep1 = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(45,212,191,0.3)]">
        <ScanSearch className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
        فحص حقيقي لحساباتك<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">بالبيانات الفعلية</span>
      </h1>
      <p className="text-lg text-slate-400 max-w-xl">
        أدخل رابط حسابك على إنستجرام، فيسبوك، تيك توك، أو X — وسنستخرج بياناتك الحقيقية ونحللها بالذكاء الاصطناعي لنعطيك تقريراً احترافياً كاملاً.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md text-sm">
        {["📊 بيانات متابعين حقيقية", "💬 معدل تفاعل محسوب", "📝 تحليل المحتوى", "🗓 خطة عمل 30 يوم"].map(f => (
          <div key={f} className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10 text-slate-300">
            {f}
          </div>
        ))}
      </div>

      <button
        onClick={() => setStep(2)}
        className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-10 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)]"
      >
        <span className="mr-2">ابدأ الفحص المجاني الآن</span>
        <ArrowRight className="w-4 h-4 ml-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-3">علامة شخصية أم شركة؟</h2>
      <p className="text-slate-400 mb-10">هذا يساعد الذكاء الاصطناعي على تكييف التحليل بدقة.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {[
          { id: "individual", label: "علامة شخصية", sub: "صناع المحتوى والمستقلين", icon: User },
          { id: "company", label: "شركة / مؤسسة", sub: "مشاريع وعلامات تجارية", icon: Building2 }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => { setFormData({ ...formData, type: opt.id }); setStep(3); }}
            className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-800/80 hover:border-teal-500/50 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <opt.icon className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
            </div>
            <div>
              <div className="text-white font-bold text-lg mb-1">{opt.label}</div>
              <div className="text-xs text-slate-500">{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-2">ما هو رابط الحساب؟</h2>
      <p className="text-slate-400 mb-8">ندعم إنستجرام، فيسبوك، تيك توك، وإكس (تويتر).</p>
      <div className="relative mb-6 text-right">
        <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="url"
          placeholder="instagram.com/username أو facebook.com/pagename"
          value={formData.platformUrl}
          onChange={(e) => setFormData({ ...formData, platformUrl: e.target.value })}
          className="w-full h-14 bg-slate-900 border border-white/10 rounded-xl px-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-left"
          dir="ltr"
        />
      </div>
      <button
        disabled={!formData.platformUrl}
        onClick={() => setStep(4)}
        className="h-14 w-full rounded-xl bg-teal-500 text-white font-bold transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        المتابعة ←
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <h2 className="text-3xl font-bold text-white mb-3">ما هي أهدافك الرئيسية؟</h2>
      <p className="text-slate-400 mb-8">اختر ما يصل إلى هدفين.</p>
      <div className="space-y-3 mb-8">
        {goalOptions.map(goal => {
          const isSelected = formData.goals.includes(goal);
          const isDisabled = formData.goals.length >= 2 && !isSelected;
          return (
            <button
              key={goal}
              disabled={isDisabled}
              onClick={() => handleGoalToggle(goal)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
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
        className="h-14 w-full rounded-xl bg-teal-500 text-white font-bold transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        الخطوة الأخيرة ←
      </button>
    </div>
  );

  const renderStep5 = () => (
    <div className="flex flex-col text-center max-w-xl mx-auto w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-indigo-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">لمن نرسل التقرير؟</h2>
      <p className="text-slate-400 mb-8">أدخل بياناتك للحصول على التقرير الكامل.</p>
      <div className="space-y-4 mb-8 text-right">
        {[
          { icon: UserCircle, placeholder: "الاسم الكامل", key: "name", type: "text" },
          { icon: Mail, placeholder: "البريد الإلكتروني", key: "email", type: "email" },
          { icon: Phone, placeholder: "رقم الواتساب (اختياري)", key: "phone", type: "tel" },
        ].map(field => (
          <div key={field.key} className="relative">
            <field.icon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type={field.type}
              placeholder={field.placeholder}
              value={(formData.contactInfo as any)[field.key]}
              onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, [field.key]: e.target.value } })}
              className="w-full h-12 bg-slate-900 border border-white/10 rounded-xl pr-12 pl-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              dir={field.key === "phone" ? "ltr" : "rtl"}
            />
          </div>
        ))}
      </div>
      <button
        disabled={!formData.contactInfo.name || !formData.contactInfo.email}
        onClick={startAnalysis}
        className="h-14 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <ScanSearch className="w-5 h-5" /> بدء الفحص الحقيقي الآن
      </button>
      <p className="text-xs text-slate-600 mt-3">⏱ قد يستغرق التحليل الحقيقي من 1-3 دقائق</p>
    </div>
  );

  const renderStep6 = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full border-4 border-t-indigo-500 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin flex items-center justify-center bg-slate-900">
              <ScanSearch className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 blur-sm animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">LENS يستخرج بياناتك الحقيقية</h2>
          <div className="max-w-sm w-full space-y-2">
            {loadingStages.map((stage, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${i === loadingStage
                ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-300"
                : i < loadingStage
                  ? "text-emerald-400 opacity-60"
                  : "text-slate-600 opacity-30"
                }`}>
                {i < loadingStage ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : i === loadingStage ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-current shrink-0" />
                )}
                <span className="text-sm text-right">{stage}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-6">يرجى الانتظار — نحن نستخرج بيانات حقيقية من المنصة</p>
        </div>
      );
    }

    if (analysisResult?.error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-red-400 py-20">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-bold mb-2">حدث خطأ أثناء التحليل</h3>
          <p className="text-slate-400 max-w-md mb-6">{analysisResult.error}</p>
          <button onClick={() => { setStep(3); setAnalysisResult(null); }} className="px-6 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (!analysisResult) return null;

    return (
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 text-right">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h2 className="text-2xl font-bold text-emerald-400 mb-1">اكتمل التقرير الحقيقي!</h2>
            <p className="text-slate-400 text-sm">
              تم استخراج بيانات @{sd?.username} من {sd?.platform} وتحليلها بالذكاء الاصطناعي
              {analysisResult.dataQuality === "real" ? " بناءً على بيانات حقيقية ✅" : " (بيانات جزئية)"}
            </p>
          </div>
          <button onClick={copyReport} className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white text-sm transition-all">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "تم النسخ" : "نسخ التقرير"}
          </button>
        </div>

        {/* Real Data Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "المتابعون", value: sd?.followers > 0 ? sd.followers.toLocaleString() : "—", icon: Users, color: "text-blue-400" },
            { label: "معدل التفاعل", value: sd?.engagementRate || "—", icon: TrendingUp, color: "text-emerald-400" },
            { label: "متوسط اللايكات", value: sd?.avgLikes > 0 ? sd.avgLikes.toLocaleString() : "—", icon: Heart, color: "text-pink-400" },
            { label: "متوسط التعليقات", value: sd?.avgComments > 0 ? sd.avgComments.toLocaleString() : "—", icon: MessageCircle, color: "text-purple-400" },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <div className="text-xl font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Bio + Profile Info */}
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          {/* Bio Text */}
          {sd?.bio && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5 md:col-span-2">
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> البايو الحقيقي</div>
              <div className="text-sm text-slate-200 leading-relaxed">"{sd.bio}"</div>
              <div className="text-xs text-amber-400 mt-2">{sd?.bioQuality}</div>
            </div>
          )}
          {!sd?.bio && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> تقييم البايو</div>
              <div className="text-sm text-amber-400 font-medium">{sd?.bioQuality}</div>
            </div>
          )}
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> تحليل المحتوى</div>
            <div className="text-sm text-slate-300">{sd?.contentQuality}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
            <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> التوثيق</div>
            <div className={`text-sm font-medium ${sd?.isVerified ? "text-emerald-400" : "text-slate-500"}`}>
              {sd?.isVerified ? "✅ حساب موثق" : "⚠️ لم يُكتشف التوثيق (Facebook لا يُظهره للسكريبر)"}
            </div>
          </div>
          {sd?.recentPostsCount > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> المنشورات المحللة</div>
              <div className="text-sm text-white font-medium">{sd.recentPostsCount} منشور حقيقي</div>
            </div>
          )}
        </div>

        {/* Posts List */}
        {sd?.recentPosts?.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Eye className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-white text-sm">آخر {sd.recentPosts.length} منشور محلّل</h3>
            </div>
            <div className="space-y-3">
              {sd.recentPosts.map((post: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-400 font-bold">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                      {post.caption || "(بدون نص)"}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      {post.likes > 0 && <span className="text-xs text-pink-400">❤️ {post.likes.toLocaleString()}</span>}
                      {post.comments > 0 && <span className="text-xs text-purple-400">💬 {post.comments.toLocaleString()}</span>}
                      {post.views > 0 && <span className="text-xs text-blue-400">👁 {post.views.toLocaleString()}</span>}
                      <span className="text-xs text-slate-600">{post.mediaType === "video" ? "🎬" : post.mediaType === "carousel" ? "🖼" : "📷"}</span>
                      {post.timestamp && <span className="text-xs text-slate-600">{new Date(post.timestamp).toLocaleDateString("ar") || post.timestamp}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The Full Report — Visual */}
        <LensReportDisplay analysisResult={analysisResult} />


        {/* CTA */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 to-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 px-4 py-1 bg-indigo-500 text-[10px] font-bold text-white tracking-widest rounded-bl-lg">الخطوة التالية</div>
          <div className="p-8 sm:flex items-center justify-between gap-6">
            <div className="mb-6 sm:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">أتريد أن ننفذ هذه الخطة لك؟</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                فريقنا جاهز لتطبيق كل ما في هذا التقرير وزيادة إيراداتك. احجز مكالمة استشارية مجانية الآن.
              </p>
            </div>
            <button className="whitespace-nowrap shrink-0 h-12 px-8 rounded-xl bg-white text-indigo-900 font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
              <Zap className="w-4 h-4" /> احجز استشارة مجانية
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] font-sans overflow-x-hidden selection:bg-teal-500/30" dir="rtl">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-1/4 w-[60vw] h-[60vw] bg-indigo-500/5 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <span className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <ScanSearch className="w-5 h-5 text-teal-400" />
          LENS
          <span className="text-sm font-normal text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden sm:block">Social Media Audit</span>
        </span>
        <div className="text-xs text-slate-500">Powered by APEX Agency</div>
      </div>

      {/* Progress */}
      {step > 1 && step < 6 && (
        <div className="relative z-10 max-w-xl mx-auto px-6 mb-4">
          <div className="flex items-center gap-2">
            {[2, 3, 4, 5].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-teal-500" : "bg-slate-800"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4" style={{ minHeight: "calc(100vh - 100px)" }}>
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
