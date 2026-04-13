"use client";
import React, { useState } from "react";
import { Send, Loader2, Copy, Check, MailCheck, Star, Zap, ChevronDown, ChevronUp, Users, Target, Sparkles } from "lucide-react";

interface Email {
  id: number;
  subject: string;
  body: string;
  hookScore: number;
  style: string;
}

const HOOK_COLOR = (score: number) => {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
};

export default function StrikerClient() {
  const [form, setForm] = useState({
    targetIndustry: "", targetPain: "", offerValue: "",
    senderName: "", senderCompany: "", tone: "احترافي"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const tones = ["احترافي", "ودّي", "مباشر وحاد", "فضولي", "قصصي"];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setEmails([]);
    setError("");
    try {
      const res = await fetch("/api/outbound/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails);
        setExpandedId(1);
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError("خطأ في الاتصال بالخادم");
    }
    setIsGenerating(false);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 pb-16">

      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/3 space-y-5">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">STRIKER — Outbound Engine</h2>
          </div>
          <p className="text-xs text-cyan-400/70 mb-5">من ai-marketing-skills/outbound-engine</p>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">القطاع المستهدف</label>
              <input type="text" required value={form.targetIndustry} onChange={e => setForm({...form, targetIndustry: e.target.value})}
                placeholder="مثال: عيادات الأسنان، المطاعم، العقارات"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl h-11 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">نقطة الألم الرئيسية</label>
              <textarea required value={form.targetPain} onChange={e => setForm({...form, targetPain: e.target.value})}
                placeholder="مثال: يعتمدون على المحال والمراجعات فقط ولا يستثمرون في الإعلانات الرقمية"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none min-h-[80px] resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">قيمة عرضك</label>
              <textarea required value={form.offerValue} onChange={e => setForm({...form, offerValue: e.target.value})}
                placeholder="مثال: نضمن 30 عميل جديد في الشهر الأول أو نُعيد المال كاملاً"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none min-h-[70px] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">اسمك</label>
                <input type="text" value={form.senderName} onChange={e => setForm({...form, senderName: e.target.value})}
                  placeholder="أحمد"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-11 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">شركتك</label>
                <input type="text" value={form.senderCompany} onChange={e => setForm({...form, senderCompany: e.target.value})}
                  placeholder="APEX Agency"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl h-11 px-4 text-sm text-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5">الأسلوب</label>
              <div className="flex flex-wrap gap-2">
                {tones.map(t => (
                  <button key={t} type="button" onClick={() => setForm({...form, tone: t})}
                    className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${form.tone === t ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400" : "border-gray-800 text-gray-500 hover:text-gray-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isGenerating}
              className="w-full h-13 mt-2 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isGenerating ? "جاري التوليد..." : "توليد 3 رسائل Outbound"}
            </button>

            {error && <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/50 rounded-xl">{error}</div>}
          </form>
        </div>

        {/* Tips */}
        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-2xl p-4">
          <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> نصائح STRIKER</div>
          <ul className="text-xs text-gray-400 space-y-1.5">
            <li>• نسخة عالية الخطاف (8+) تحصل على 3x معدل فتح أعلى</li>
            <li>• اختبر كل نسخة في PULSE لمعرفة الأقوى</li>
            <li>• لا تُرسل بالجملة — خصّص الاسم والشركة</li>
            <li>• أفضل وقت: الثلاثاء والأربعاء 9ص–11ص</li>
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-2/3">
        {emails.length === 0 && !isGenerating && (
          <div className="flex-1 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center py-32 text-gray-600">
            <MailCheck className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold">STRIKER جاهز</h3>
            <p className="mt-2 text-sm text-center max-w-md">أدخل بيانات حملتك وسيولّد 3 رسائل cold email بأساليب مختلفة مع تقييم قوة الخطاف</p>
          </div>
        )}

        {isGenerating && (
          <div className="flex-1 border-2 border-dashed border-cyan-900/30 rounded-3xl flex flex-col items-center justify-center py-32">
            <Send className="w-12 h-12 text-cyan-500 animate-pulse mb-4" />
            <p className="font-bold text-cyan-400 animate-pulse">يكتب STRIKER رسائل قناصة...</p>
          </div>
        )}

        {emails.length > 0 && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-1">
              <MailCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-gray-300">{emails.length} رسائل جاهزة — اختر الأقوى وأدخلها في PULSE</span>
            </div>

            {emails.map((email) => {
              const isExpanded = expandedId === email.id;
              return (
                <div key={email.id} className="bg-gray-900 border border-gray-800 hover:border-cyan-500/20 rounded-2xl overflow-hidden transition-all">
                  <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : email.id)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-black text-cyan-400">#{email.id}</span>
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{email.style}</span>
                          <div className="flex items-center gap-1">
                            <Star className={`w-3 h-3 ${HOOK_COLOR(email.hookScore)}`} />
                            <span className={`text-xs font-black ${HOOK_COLOR(email.hookScore)}`}>خطاف {email.hookScore}/10</span>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-white">📧 {email.subject}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(email.id, `Subject: ${email.subject}\n\n${email.body}`); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-bold transition-all">
                          {copiedId === email.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          {copiedId === email.id ? "تم" : "نسخ"}
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-800 p-5 bg-gray-950/50">
                      <div className="text-sm text-gray-200 leading-8 whitespace-pre-wrap">{email.body}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
