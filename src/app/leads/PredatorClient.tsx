"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Star, MapPin, Phone, Globe, ChevronDown, ChevronUp, AlertCircle, MessageCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PredatorClient({ initialLeads, hasToken }: { initialLeads: any[], hasToken: boolean }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("عيادات أسنان");
  const [city, setCity] = useState("الرياض");
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [leads, setLeads] = useState(initialLeads);

  // Update local state when server props change (due to router.refresh)
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setMessage("جاري بدء فحص PREDATOR...");

    try {
      const res = await fetch("/api/leads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, city })
      });
      const data = await res.json();
      
      if (data.success && data.runId) {
        setMessage(`تم تفعيل الصائد... جاري المسح لـ "${keyword}" في "${city}". ${!hasToken ? '(وضع وهمي)' : '(قد يستغرق دقيقة)'}`);
        await pollRunStatus(data.runId);
      } else {
        setMessage("حدث خطأ أثناء الاتصال بالخادم.");
        setIsSearching(false);
      }
    } catch (error) {
      setMessage("فشل الاتصال الخادم.");
      setIsSearching(false);
    }
  };

  const pollRunStatus = async (runId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/leads/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId, keyword, city })
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(pollInterval);
          setMessage("✅ " + data.message);
          setIsSearching(false);
          router.refresh(); 
        } else {
          setMessage(`الروبوت يقوم بالمسح... الحالة: ${data.status || 'RUNNING'}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.scoreLabel === 'HOT').length,
    warm: leads.filter(l => l.scoreLabel === 'WARM').length,
    cold: leads.filter(l => l.scoreLabel === 'COLD').length,
    ice: leads.filter(l => l.scoreLabel === 'ICE').length,
    avg: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0
  };

  const filteredLeads = filter === "ALL" ? leads : leads.filter(l => l.scoreLabel === filter);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 flex items-center gap-3">
            🎯 محرك PREDATOR
          </h1>
          <p className="text-gray-400 mt-2">صائد العملاء الفائق. ابحث عن الأعمال والمحلات وقم باستهدافها بأرجاء المدينة.</p>
        </div>
        
        {!hasToken && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>يعمل في <strong>الوضع التجريبي (Mock)</strong> لعدم وجود APIFY_API_TOKEN.</span>
          </div>
        )}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">الكلمة المفتاحية</label>
          <input 
            type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg h-12 px-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">المدينة</label>
          <input 
            type="text" value={city} onChange={e => setCity(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-lg h-12 px-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="w-full md:w-32 space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">العدد الأقصى</label>
          <input 
            type="number" defaultValue={20} disabled
            className="w-full bg-gray-950 border border-gray-800 rounded-lg h-12 px-4 opacity-50 cursor-not-allowed"
          />
        </div>
        <button 
          type="submit" disabled={isSearching}
          className="h-12 px-8 w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          <span>بدء الفحص</span>
        </button>
      </form>

      {message && (
        <div className="bg-blue-900/20 border border-blue-800 text-blue-300 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
          {isSearching && <Loader2 className="w-4 h-4 animate-spin" />}
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard title="إجمالي العملاء" value={stats.total} color="blue" onClick={() => setFilter("ALL")} active={filter === "ALL"} />
        <StatCard title="HOT (نار)" value={stats.hot} color="red" onClick={() => setFilter("HOT")} active={filter === "HOT"} />
        <StatCard title="WARM (دافئ)" value={stats.warm} color="orange" onClick={() => setFilter("WARM")} active={filter === "WARM"} />
        <StatCard title="COLD (بارد)" value={stats.cold} color="yellow" onClick={() => setFilter("COLD")} active={filter === "COLD"} />
        <StatCard title="ICE (متجمد)" value={stats.ice} color="cyan" onClick={() => setFilter("ICE")} active={filter === "ICE"} />
        <StatCard title="متوسط النقاط" value={`${stats.avg}%`} color="gray" onClick={() => {}} active={false} />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'].map((status) => {
          const colLeads = filteredLeads.filter(l => l.status === status);
          
          const statusLabels: any = {
            'NEW': { title: 'جديد', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
            'CONTACTED': { title: 'تم التواصل', color: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
            'QUALIFIED': { title: 'مؤهل للشراء', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500' },
            'CONVERTED': { title: 'تم الإغلاق (مغلق)', color: 'border-green-500/50 bg-green-500/10 text-green-400' },
            'LOST': { title: 'رفض (خسارة)', color: 'border-red-500/50 bg-red-500/10 text-red-400' }
          };

          return (
            <div 
              key={status} 
              className="flex-shrink-0 w-80 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col snap-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault();
                const leadId = e.dataTransfer.getData("leadId");
                if (!leadId) return;
                
                // Optimistic UI update
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
                
                // Server update
                try {
                   await fetch('/api/leads/update-status', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ leadId, newStatus: status })
                   });
                } catch (err) {
                   console.error('Failed to update lead status');
                }
              }}
            >
              <div className={`m-3 px-4 py-2 flex items-center justify-between rounded-xl border ${statusLabels[status].color}`}>
                <h2 className="font-bold">{statusLabels[status].title}</h2>
                <span className="text-xs font-black bg-black/30 px-2 py-0.5 rounded-full">{colLeads.length}</span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar">
                {colLeads.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-gray-700 text-sm border-2 border-dashed border-gray-800 rounded-xl">
                    اسحب وأفلت هنا
                  </div>
                )}
                {colLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("leadId", lead.id)}
                    className="bg-gray-950 border border-gray-800 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-100 flex-1">{lead.companyName}</h3>
                       <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap font-bold border ${getBadgeStyle(lead.scoreLabel)}`}>
                             Score: {lead.score}
                          </span>
                          {lead.priority && (
                             <span className={`px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap font-bold border ${lead.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : lead.priority === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                               الأولوية: {lead.priority === 'High' ? 'عالية 🔥' : lead.priority === 'Medium' ? 'متوسطة' : 'منخفضة'}
                             </span>
                          )}
                       </div>
                    </div>
                    
                    <div className="text-gray-500 text-xs flex flex-col gap-1.5 mb-3">
                       <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {lead.city}</span>
                       <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star className="w-3 h-3 fill-current"/> {lead.rating?.toFixed(1)} ({lead.reviewsCount})</span>
                    </div>

                    {/* AI NEXT BEST ACTION WIDGET */}
                    {lead.nextAction ? (
                       <div className="mb-3 bg-[#1a1528] border border-purple-500/30 p-2 rounded-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-fuchsia-600"></div>
                          <div className="text-[10px] text-purple-400 font-bold mb-1 flex items-center gap-1">
                             <Sparkles className="w-3 h-3" /> إجراء البيع التالي المقترح (AI)
                          </div>
                          <p className="text-xs text-gray-200 leading-relaxed font-bold">
                             {lead.nextAction}
                          </p>
                       </div>
                    ) : (
                       <button 
                         onClick={async () => {
                           const btn = document.getElementById(`ai-btn-${lead.id}`);
                           if(btn) { btn.innerHTML = '<span class="animate-pulse">جاري التحليل...</span>'; btn.setAttribute('disabled', 'true'); }
                           const idx = leads.findIndex(l => l.id === lead.id);
                           const res = await fetch('/api/leads/ai-analyze', { method: 'POST', body: JSON.stringify({ leadId: lead.id }) });
                           const data = await res.json();
                           if(data.success) {
                              setLeads(prev => {
                                 const n = [...prev];
                                 n[idx] = data.lead;
                                 return n;
                              });
                           } else {
                              if(btn) { btn.innerHTML = 'فشل التحليل'; }
                           }
                         }}
                         id={`ai-btn-${lead.id}`}
                         className="w-full mb-3 text-xs bg-gray-900 border border-purple-500/30 text-purple-400 py-1.5 rounded flex items-center justify-center gap-1 hover:bg-purple-900/20 transition-colors"
                       >
                         <Sparkles className="w-3 h-3" /> تحليل العميل واستخراج الإجراء
                       </button>
                    )}

                    {lead.contactPhone ? (
                       <a href={`https://wa.me/${lead.contactPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-full text-xs bg-green-500/10 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/20 flex items-center justify-center gap-2 transition-colors font-bold">
                         <MessageCircle className="w-3 h-3" /> محادثة الواتساب
                       </a>
                    ) : (
                       <div className="w-full text-xs text-center border border-dashed border-gray-800 text-gray-600 py-2 rounded-lg">لا يوجد رقم للمنشأة</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ title, value, color, onClick, active }: any) {
  const colorMap: Record<string, string> = {
    red: "from-red-600/20 to-red-900/10 text-red-500 border-red-500/30",
    orange: "from-orange-600/20 to-orange-900/10 text-orange-500 border-orange-500/30",
    blue: "from-blue-600/20 to-blue-900/10 text-blue-500 border-blue-500/30",
    yellow: "from-yellow-600/20 to-yellow-900/10 text-yellow-500 border-yellow-500/30",
    cyan: "from-cyan-600/20 to-cyan-900/10 text-cyan-500 border-cyan-500/30",
    gray: "from-gray-600/20 to-gray-900/10 text-gray-400 border-gray-600/30",
  };
  
  const activeClass = active ? "ring-2 ring-white/50 bg-opacity-100" : "hover:bg-opacity-50 opacity-80 cursor-pointer";

  return (
    <div 
      onClick={onClick}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all ${activeClass}`}
    >
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider">{title}</div>
    </div>
  );
}

function getScoreColor(label: string) {
  if (label === 'HOT') return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
  if (label === 'WARM') return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
  if (label === 'COLD') return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
  return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
}

function getBadgeStyle(label: string) {
  if (label === 'HOT') return 'bg-red-500/10 text-red-500 border-red-500/30';
  if (label === 'WARM') return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
  if (label === 'COLD') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
  return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
}

function ProgressBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-mono">{value}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
