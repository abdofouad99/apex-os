"use client";

import { TrendingUp, Zap, AlertTriangle, Target, Calendar, Lightbulb, CheckCircle2, XCircle, BarChart3, ArrowUp, Shield } from "lucide-react";

// ── Section metadata ──
const SECTION_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  "الخلاصة": { icon: "🎯", color: "text-teal-300", bg: "bg-teal-500/5", border: "border-teal-500/20" },
  "الهوية": { icon: "🆔", color: "text-blue-300", bg: "bg-blue-500/5", border: "border-blue-500/20" },
  "تحليل التفاعل": { icon: "📊", color: "text-purple-300", bg: "bg-purple-500/5", border: "border-purple-500/20" },
  "تحليل المحتوى": { icon: "📝", color: "text-indigo-300", bg: "bg-indigo-500/5", border: "border-indigo-500/20" },
  "نقاط القوة": { icon: "💪", color: "text-emerald-300", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
  "نقاط الضعف": { icon: "⚠️", color: "text-amber-300", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  "الأخطاء": { icon: "🔴", color: "text-red-300", bg: "bg-red-500/5", border: "border-red-500/20" },
  "فرص النمو": { icon: "📈", color: "text-cyan-300", bg: "bg-cyan-500/5", border: "border-cyan-500/20" },
  "خطة العمل": { icon: "🗓", color: "text-orange-300", bg: "bg-orange-500/5", border: "border-orange-500/20" },
  "توصيات": { icon: "📌", color: "text-pink-300", bg: "bg-pink-500/5", border: "border-pink-500/20" },
};

function getSectionMeta(title: string) {
  for (const [key, val] of Object.entries(SECTION_META)) {
    if (title.includes(key)) return val;
  }
  return { icon: "📄", color: "text-slate-300", bg: "bg-slate-800", border: "border-white/5" };
}

// ── Score Calculator ──
function calcScore(sd: any): number {
  if (!sd) return 50;
  let score = 40;
  const eng = parseFloat(sd.engagementRate) || 0;
  if (eng >= 6) score += 40;
  else if (eng >= 3) score += 30;
  else if (eng >= 1) score += 18;
  else if (eng >= 0.3) score += 8;

  if (sd.bio && sd.bio.length > 50) score += 5;
  if (sd.isVerified) score += 5;
  if ((sd.followers || 0) > 10000) score += 5;
  if ((sd.recentPostsCount || 0) >= 10) score += 5;

  return Math.min(100, Math.max(10, score));
}

function getScoreLabel(score: number): { label: string; color: string; ring: string } {
  if (score >= 80) return { label: "ممتاز 🏆", color: "text-emerald-400", ring: "stroke-emerald-400" };
  if (score >= 65) return { label: "جيد ✅", color: "text-blue-400", ring: "stroke-blue-400" };
  if (score >= 45) return { label: "متوسط ⚠️", color: "text-amber-400", ring: "stroke-amber-400" };
  return { label: "ضعيف 🔴", color: "text-red-400", ring: "stroke-red-400" };
}

// ── Circular Score ──
function ScoreCircle({ score }: { score: number }) {
  const { label, color, ring } = getScoreLabel(score);
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-800" />
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
            className={`${ring} transition-all duration-1000`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${color}`}>{score}</span>
          <span className="text-slate-500 text-xs">/100</span>
        </div>
      </div>
      <span className={`font-bold text-sm ${color}`}>{label}</span>
    </div>
  );
}

// ── Parse Markdown into Sections ──
function parseReport(text: string): { title: string; content: string }[] {
  if (!text) return [];
  const lines = text.split("\n");
  const sections: { title: string; content: string }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push({ title: current.title, content: current.lines.join("\n").trim() });
      current = { title: line.replace(/^##\s+/, "").replace(/[*_]/g, "").trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push({ title: current.title, content: current.lines.join("\n").trim() });
  return sections;
}

// ── Render Content with Bullet Formatting ──
function RenderContent({ content }: { content: string }) {
  const lines = content.split("\n").filter(l => l.trim());
  return (
    <div className="space-y-1.5 text-right">
      {lines.map((line, i) => {
        const clean = line.replace(/^[-•*]\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
        if (!clean) return null;
        const isBullet = /^[-•*\d]/.test(line.trim());
        const isSubHeader = line.trim().startsWith("###");
        if (isSubHeader) {
          return <p key={i} className="text-white font-semibold text-sm mt-3">{clean.replace(/^#+\s*/, "")}</p>;
        }
        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-slate-500 text-xs mt-1 shrink-0">•</span>
              <p className="text-slate-300 text-sm leading-relaxed">{clean}</p>
            </div>
          );
        }
        return <p key={i} className="text-slate-300 text-sm leading-relaxed">{clean}</p>;
      })}
    </div>
  );
}

// ── Critical Insight Extractor ──
function extractCriticalInsight(report: string): string | null {
  const keywords = ["أخطاء", "حرجة", "قاتل", "مشكلة", "0%", "ضعيف جداً", "تتجاهل"];
  const lines = report.split("\n");
  for (const line of lines) {
    if (keywords.some(k => line.includes(k)) && line.length > 30 && line.length < 200) {
      return line.replace(/^[-•*#\s]+/, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
    }
  }
  return null;
}

// ── Main Component ──
export default function LensReportDisplay({ analysisResult }: { analysisResult: any }) {
  const sd = analysisResult?.socialData;
  const report = analysisResult?.report || "";
  const score = calcScore(sd);
  const { color } = getScoreLabel(score);
  const sections = parseReport(report);
  const criticalInsight = extractCriticalInsight(report);

  // Separate strengths/weaknesses for special display
  const strengths = sections.find(s => s.title.includes("القوة"));
  const weaknesses = sections.find(s => s.title.includes("الضعف") || s.title.includes("الأخطاء"));
  const actionPlan = sections.find(s => s.title.includes("خطة") || s.title.includes("الأسبوع"));
  const otherSections = sections.filter(s =>
    !s.title.includes("القوة") &&
    !s.title.includes("الضعف") &&
    !s.title.includes("الأخطاء") &&
    !s.title.includes("خطة")
  );

  return (
    <div className="space-y-6">

      {/* ── Score Header ── */}
      <div className="rounded-2xl bg-slate-900 border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreCircle score={score} />
          <div className="flex-1 text-right">
            <h3 className="text-white font-bold text-lg mb-1">نتيجة الحساب الكلية</h3>
            <p className="text-slate-400 text-sm mb-4">محسوبة من معدل التفاعل، البايو، المنشورات الحقيقية</p>
            {/* Score breakdown */}
            <div className="space-y-2">
              {[
                {
                  label: "معدل التفاعل", 
                  value: parseFloat(sd?.engagementRate) || 0,
                  max: 10,
                  color: "bg-purple-500"
                },
                {
                  label: "جودة المحتوى",
                  value: (sd?.recentPostsCount || 0) >= 10 ? 8 : 4,
                  max: 10,
                  color: "bg-blue-500"
                },
                {
                  label: "قوة الصفحة",
                  value: sd?.bio?.length > 50 ? 8 : 4,
                  max: 10,
                  color: "bg-teal-500"
                },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-28 text-right shrink-0">{item.label}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-left">{item.value.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Critical Insight ── */}
      {criticalInsight && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-5 flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🔥</div>
          <div className="text-right">
            <p className="text-red-400 font-bold text-sm mb-1">المشكلة الحرجة الأولى</p>
            <p className="text-slate-200 text-sm leading-relaxed">{criticalInsight}</p>
          </div>
        </div>
      )}

      {/* ── Strengths + Weaknesses ── */}
      {(strengths || weaknesses) && (
        <div className="grid md:grid-cols-2 gap-4">
          {strengths && (
            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm">نقاط القوة</span>
              </div>
              <RenderContent content={strengths.content} />
            </div>
          )}
          {weaknesses && (
            <div className="rounded-xl bg-amber-950/30 border border-amber-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-bold text-sm">نقاط الضعف</span>
              </div>
              <RenderContent content={weaknesses.content} />
            </div>
          )}
        </div>
      )}

      {/* ── Other Sections ── */}
      {otherSections.map((section, i) => {
        const meta = getSectionMeta(section.title);
        return (
          <div key={i} className={`rounded-xl ${meta.bg} border ${meta.border} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{meta.icon}</span>
              <h4 className={`font-bold text-sm ${meta.color}`}>{section.title}</h4>
            </div>
            <RenderContent content={section.content} />
          </div>
        );
      })}

      {/* ── Action Plan ── */}
      {actionPlan && (
        <div className="rounded-xl bg-orange-950/20 border border-orange-500/20 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-orange-400" />
            <h4 className="text-orange-400 font-bold text-sm">{actionPlan.title}</h4>
          </div>
          {/* Parse weeks */}
          {(() => {
            const weeks = actionPlan.content.split(/###\s+/).filter(Boolean);
            if (weeks.length <= 1) return <RenderContent content={actionPlan.content} />;
            return (
              <div className="grid sm:grid-cols-2 gap-3">
                {weeks.map((week, wi) => {
                  const lines = week.split("\n");
                  const title = lines[0]?.trim();
                  const body = lines.slice(1).join("\n");
                  return (
                    <div key={wi} className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-white font-semibold text-xs mb-2">{title}</p>
                      <RenderContent content={body} />
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
