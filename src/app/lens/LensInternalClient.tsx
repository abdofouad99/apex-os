"use client";

import { useState } from "react";
import { 
  ScanSearch, Search, UserCircle, ExternalLink, 
  BarChart, Download, MoreVertical, ShieldAlert
} from "lucide-react";

const MOCK_LEADS = [
  { id: 1, name: "شركة النور للتسويق", type: "company", platform: "instagram.com/alnoor", goals: ["زيادة المبيعات"], email: "contact@alnoor.com", phone: "+966500000001", date: "منذ ساعتين", status: "تقرير جاهز" },
  { id: 2, name: "أحمد الفارس", type: "individual", platform: "tiktok.com/@ahmed", goals: ["بناء سلطة", "زيادة المتابعين"], email: "ahmed@example.com", phone: "+966500000002", date: "منذ 5 ساعات", status: "في الانتظار" },
  { id: 3, name: "مطعم ريحان", type: "company", platform: "instagram.com/rayhan", goals: ["زيادة التفاعل"], email: "info@rayhan.com", phone: "+966500000003", date: "البارحة", status: "تم التواصل" },
];

export default function LensInternalClient() {
  const [activeTab, setActiveTab] = useState("leads");

  return (
    <div className="min-h-screen p-6 space-y-6 max-w-[1400px] mx-auto" dir="rtl">
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-950/40 via-slate-900/60 to-slate-950/80 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.08),transparent_60%)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-lg shadow-teal-500/25">
              <ScanSearch className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                LENS Engine <span className="text-teal-400 font-normal">| محرك التدقيق والتحليل</span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                إدارة طلبات الفحص المجانية (Leads) و الفحص الداخلي لحسابات العملاء.
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => window.open("/lens/public", "_blank")}
            className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm font-bold text-teal-400 hover:bg-teal-500/20 transition-all"
          >
            <ExternalLink className="h-4 w-4" /> فتح الصفحة العامة (Public)
          </button>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-4 gap-4 mt-8">
          {[
            { label: "حساب تم فحصه", value: "14" },
            { label: "عميل محتمل (Lead)", value: "3" },
            { label: "معدل الإغلاق المتوقع", value: "22%" },
            { label: "كفاءة الذكاء الاصطناعي", value: "99.8%" },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab("leads")} 
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "leads" ? "bg-teal-500 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
        >
          العملاء المحتملين (Leads)
        </button>
        <button 
          onClick={() => setActiveTab("newReport")} 
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "newReport" ? "bg-teal-500 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
        >
          + عمل فحص جديد لعميل
        </button>
      </div>

      {activeTab === "leads" && (
        <div className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-teal-400" /> 
              البيانات الواردة من الصفحة العامة
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="بحث بالاسم أو الرابط..." className="h-9 w-64 bg-slate-950 border border-white/10 rounded-lg pr-9 pl-4 text-xs text-white" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">العميل</th>
                  <th className="px-6 py-4 font-medium">المنصة</th>
                  <th className="px-6 py-4 font-medium">التواصل</th>
                  <th className="px-6 py-4 font-medium">الهدف</th>
                  <th className="px-6 py-4 font-medium">التوقيت</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {MOCK_LEADS.map(lead => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.type === 'company' ? 'شركة' : 'شخصي'}</div>
                    </td>
                    <td className="px-6 py-4" dir="ltr">
                      <a href={`https://${lead.platform}`} target="_blank" className="text-teal-400 hover:underline">{lead.platform}</a>
                    </td>
                    <td className="px-6 py-4">
                      <div>{lead.email}</div>
                      <div className="text-slate-500" dir="ltr">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {lead.goals.map(g => (
                        <span key={g} className="inline-block bg-white/5 px-2 py-1 rounded bg-slate-800 border border-white/10 mr-1 mb-1">{g}</span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{lead.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        lead.status === "تقرير جاهز" ? "bg-teal-500/10 text-teal-400" :
                        lead.status === "تم التواصل" ? "bg-indigo-500/10 text-indigo-400" :
                        "bg-amber-500/10 text-amber-400"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <button className="p-1 hover:bg-white/10 rounded-md text-slate-400"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "newReport" && (
        <div className="flex flex-col items-center justify-center p-20 text-center rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur">
          <ShieldAlert className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">مولد التقارير الداخلي (قيد التطوير)</h3>
          <p className="text-sm text-slate-400 max-w-md">
            ستتمكن قريباً من إدخال رابط العميل هنا وسيقوم النظام بتوليد واجهة PDF بالكامل مع شعار وكالتك لإرسالها للعميل بضغطة زر. لمشاهدة آلية العمل الحالية، جرب الصفحة العامة `/lens/public`.
          </p>
        </div>
      )}

    </div>
  );
}
