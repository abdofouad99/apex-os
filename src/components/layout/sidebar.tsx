"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Target, Ghost, Flame, Settings, Rocket,
  FlaskConical, Send, BarChart3, Search, Microscope, Layers,
  Brain, Zap, ScanSearch
} from "lucide-react";

const SECTIONS = [
  {
    title: "المحركات الأساسية",
    links: [
      { href: "/", label: "الرئيسية", icon: LayoutDashboard },
      { href: "/leads", label: "صيد العملاء (PREDATOR)", icon: Target },
      { href: "/competitors", label: "مراقبة المنافسين (GHOST)", icon: Ghost },
      { href: "/forge", label: "مصنع المحتوى (FORGE)", icon: Flame },
    ]
  },
  {
    title: "محركات النمو",
    links: [
      { href: "/growth", label: "تجارب النمو (PULSE)", icon: FlaskConical },
      { href: "/outbound", label: "الحملات الخارجية (STRIKER)", icon: Send },
      { href: "/intelligence", label: "الاستخبارات (INTEL)", icon: Search },
    ]
  },
  {
    title: "تحليل ومعرفة",
    links: [
      { href: "/analytics", label: "ذكاء الإيرادات (VAULT)", icon: BarChart3 },
      { href: "/research", label: "مختبر الأبحاث (LAB)", icon: Microscope },
      { href: "/studio", label: "استوديو APEX", icon: Layers },
    ]
  },
  {
    title: "القوة المتقدمة ⚡",
    links: [
      { href: "/psyche", label: "النفسيات والاحتفاظ (PSYCHE)", icon: Brain },
      { href: "/launch", label: "الإطلاق والنمو (LAUNCH)", icon: Zap },
      { href: "/lens", label: "محرك التدقيق (LENS)", icon: ScanSearch },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside className="fixed right-0 top-0 z-40 h-screen w-72 border-l border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6 scrollbar-thin">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white flex flex-col">
            APEX 
            <span className="text-[10px] text-indigo-400 -mt-1 uppercase tracking-widest font-semibold">Agency OS</span>
          </span>
        </Link>

        {/* Nav Sections */}
        <nav className="flex-1 space-y-6">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <div className="text-[10px] font-bold text-slate-600 mb-2 px-2 tracking-widest uppercase">{section.title}</div>
              <div className="space-y-1">
                {section.links.map(link => {
                  const active = isActive(link.href);
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-all duration-200 group relative ${
                        active 
                          ? "bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20" 
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-100 border border-transparent"
                      }`}>
                      {active && <div className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-indigo-500" />}
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                      <span className="truncate">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 mt-4">
          <div className="text-center mb-3">
            <div className="text-[10px] text-slate-600">25/25 أدوات مُفعَّلة ⚡</div>
            <div className="w-full bg-slate-900 rounded-full h-1 mt-1">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 h-1 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <Link href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-all ${
              pathname.startsWith("/settings") 
                ? "bg-slate-800/50 text-white font-bold border border-white/10" 
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}>
            <Settings className="h-4 w-4" />
            الإعدادات والربط
          </Link>
        </div>
      </div>
    </aside>
  );
}
