import Link from "next/link";
import { Copy, Target, Sparkles, Ghost, Database, Server, Star, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";

import { FacebookLoginButton } from "@/components/auth/FacebookLoginButton";

export default async function DashboardPage() {
  // Fetch real metrics from the DB
  const leadsCount = await prisma.lead.count();
  const competitorsCount = await prisma.competitor.count();
  const adsCount = await prisma.competitorAd.count();
  const ideasCount = await prisma.contentIdea.count();

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-cairo" dir="rtl">
      
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-10 flex flex-col md:flex-row items-start justify-between gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-4 mb-2">
              مرصد الأداء <span className="text-xl px-3 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20 font-bold">نشط</span>
           </h1>
           <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
             مرحباً بك في مركز قيادة وكالة التسويق (APEX OS). من هنا يمكنك مراقبة جميع المحركات الحيوية واتخاذ قراراتك الإستراتيجية.
           </p>
        </div>
        <div className="mt-4 md:mt-0">
          <FacebookLoginButton />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="العملاء المحتملين" value={leadsCount} icon={<Target />} color="text-red-500" bg="bg-red-500/10" border="border-red-500/20" />
          <StatCard title="المنافسين تحت المراقبة" value={competitorsCount} icon={<Ghost />} color="text-purple-500" bg="bg-purple-500/10" border="border-purple-500/20" />
          <StatCard title="الإعلانات المسحوبة" value={adsCount} icon={<Database />} color="text-indigo-500" bg="bg-indigo-500/10" border="border-indigo-500/20" />
          <StatCard title="الأفكار الماركتينج المكتوبة" value={ideasCount} icon={<Sparkles />} color="text-orange-500" bg="bg-orange-500/10" border="border-orange-500/20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Navigation Cards */}
           <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Link href="/leads" className="group relative bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-red-500/50 transition-all overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400" />
                 <Target className="w-10 h-10 text-red-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">صائد العملاء (PREDATOR)</h2>
                 <p className="text-gray-400 text-sm mb-6">ابحث واستخرج بيانات الشركات، قيم ذكياً فرص البيع، وابدأ في الإغلاق مباشرة.</p>
                 <span className="flex items-center gap-2 text-red-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                   إدارة العملاء <ArrowLeft className="w-4 h-4"/>
                 </span>
              </Link>
              
              <Link href="/competitors" className="group relative bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-purple-500/50 transition-all overflow-hidden lg:col-span-2">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400" />
                 <Ghost className="w-10 h-10 text-purple-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">مراقب المنافسين (GHOST)</h2>
                 <p className="text-gray-400 text-sm mb-6">تجسس على الإعلانات النشطة للمنافسين، اعرف أسرار تسويقهم وقوة خطافاتهم بدقة.</p>
                 <span className="flex items-center gap-2 text-purple-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                   استطلاع المنافسين <ArrowLeft className="w-4 h-4"/>
                 </span>
              </Link>

              <Link href="/clients" className="group relative bg-gradient-to-br from-blue-900/20 to-gray-950 p-6 rounded-3xl border border-blue-900/50 hover:border-blue-500/50 transition-all overflow-hidden lg:col-span-2">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                 <Database className="w-10 h-10 text-blue-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">مركز العملاء (GRAPH API)</h2>
                 <p className="text-gray-400 text-sm mb-6">شاشة المراقبة المباشرة لحسابات العملاء، الصفحات الإعلانية والميزانيات المسحوبة فورياً من فيسبوك.</p>
                 <span className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                   عرض الصفحات المُدارة <ArrowLeft className="w-4 h-4"/>
                 </span>
              </Link>

              <Link href="/forge" className="group relative bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-orange-500/50 transition-all overflow-hidden lg:col-span-2">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-orange-400" />
                 <Sparkles className="w-10 h-10 text-orange-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">مصنع المحتوى (FORGE)</h2>
                 <p className="text-gray-400 text-sm mb-6">استخدم نظام الذكاء الاصطناعي لكتابة الـ Copywriting وبناء الإعلانات في ثوانٍ معدودة.</p>
                 <span className="flex items-center gap-2 text-orange-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                   دخول المصنع <ArrowLeft className="w-4 h-4"/>
                 </span>
              </Link>
           </div>

           {/* System Status Panel */}
           <div className="col-span-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl relative">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-gray-800 pb-4">حالة النظام الفرعية</h3>
              <ul className="space-y-4">
                 <StatusItem label="خادم الذكاء الاصطناعي (Gemini)" status="متصل" icon={<Sparkles className="w-4 h-4"/>} isGood={true} />
                 <StatusItem label="نظام المزامنة (Apify)" status="جاهز" icon={<Server className="w-4 h-4"/>} isGood={true} />
                 <StatusItem label="قاعدة البيانات (Supabase)" status="مستقرة" icon={<Database className="w-4 h-4"/>} isGood={true} />
                 <StatusItem label="جودة الإعلانات المحفوظة" status="ممتازة" icon={<Star className="w-4 h-4"/>} isGood={true} />
              </ul>
              
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-gray-950 rounded-2xl border border-gray-800 text-center">
                 <div className="text-xs text-gray-500 font-bold mb-1">تحديث البيانات</div>
                 <div className="text-green-400 text-sm font-bold animate-pulse">يتم تشغيل المزامنة فورياً</div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, border }: any) {
  return (
    <div className={`p-6 rounded-3xl border border-gray-800 bg-gray-900 shadow-md flex items-center gap-4`}>
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color} ${border} border`}>
          {icon}
       </div>
       <div>
         <div className="text-3xl font-black text-white">{value}</div>
         <div className="text-gray-400 text-sm font-bold mt-1">{title}</div>
       </div>
    </div>
  );
}

function StatusItem({ label, status, icon, isGood }: any) {
  return (
    <li className="flex items-center justify-between text-sm">
       <div className="flex items-center gap-2 text-gray-300">
          <div className="text-gray-500">{icon}</div>
          {label}
       </div>
       <div className={`font-bold px-2 py-1 rounded bg-opacity-10 text-xs ${isGood ? 'bg-green-500 text-green-400 border border-green-500/20' : 'bg-red-500 text-red-400 border border-red-500/20'}`}>
          {status}
       </div>
    </li>
  );
}
