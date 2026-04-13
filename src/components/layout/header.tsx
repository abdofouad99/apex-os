"use client";

import { Bell, Search, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  // Create a nice breadcrumb title based on the path
  const getPageTitle = () => {
    if (pathname === "/") return "اللوحة الرئيسية";
    if (pathname.includes("/leads")) return "صيد العملاء (PREDATOR) 🎯";
    if (pathname.includes("/competitors")) return "مراقبة المنافسين (GHOST) 👻";
    if (pathname.includes("/forge")) return "مصنع المحتوى (FORGE) 🔥";
    if (pathname.includes("/growth")) return "تجارب النمو (PULSE) 🧪";
    if (pathname.includes("/outbound")) return "الحملات الخارجية (STRIKER) 📧";
    if (pathname.includes("/intelligence")) return "الاستخبارات التسويقية (INTEL) 🔍";
    if (pathname.includes("/analytics")) return "ذكاء الإيرادات (VAULT) 📊";
    if (pathname.includes("/research")) return "مختبر الأبحاث (LAB) 🔬";
    if (pathname.includes("/studio")) return "استوديو APEX 🎬";
    if (pathname.includes("/psyche")) return "النفسيات والاحتفاظ (PSYCHE) 🧠";
    if (pathname.includes("/launch")) return "الإطلاق والنمو (LAUNCH) 🚀";
    if (pathname.includes("/settings")) return "الإعدادات ⚙️";
    return "نظام APEX";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/80 px-6 backdrop-blur-xl">
      
      {/* Current Page Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-slate-100 tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center gap-4">
        
        {/* Fake Search Bar for OS feel */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="البحث في النظام (Ctrl+K)..." 
            className="h-9 w-64 rounded-full border border-white/10 bg-slate-900/50 pr-10 pl-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            disabled
          />
        </div>

        {/* Buttons */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-900/50 text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-indigo-500"></span>
          <span className="absolute top-2 right-2 flex h-2 w-2 animate-ping rounded-full bg-indigo-500 opacity-75"></span>
        </button>

        {/* Fake Profile Dropdown Trigger */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-md cursor-pointer hover:scale-105 transition-transform">
          <User className="h-4 w-4 text-white" />
        </div>
        
      </div>

    </header>
  );
}
