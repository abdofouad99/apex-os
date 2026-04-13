"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PredatorSearchClient() {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !city) {
      setMessage("يرجى تعبئة الكلمة المفتاحية والمدينة");
      return;
    }

    setIsSearching(true);
    setMessage("جاري بدء الاتصال بالروبوت...");

    try {
      const res = await fetch("/api/leads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, city })
      });

      const data = await res.json();
      
      if (data.success && data.runId) {
        setMessage(`تم التفعيل. جاري المسح لـ ${keyword} في ${city}... يرجى الانتظار (قد يستغرق دقيقة).`);
        await pollRunStatus(data.runId);
      } else {
        setMessage("حدث خطأ أثناء الاتصال بالخادم.");
        setIsSearching(false);
      }
    } catch (error) {
      setMessage("فشل الاتصال بـ Apify.");
      setIsSearching(false);
    }
  };

  const pollRunStatus = async (runId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/leads/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId })
        });
        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(pollInterval);
          setMessage("✅ " + data.message);
          setIsSearching(false);
          router.refresh(); // Refresh the server component table!
        } else {
          setMessage(`الروبوت يمسح الخرائط الآن... الحالة: ${data.status || 'RUNNING'}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000); // Poll every 5 seconds
  };

  return (
    <div className="flex flex-col gap-3 w-full xl:w-auto">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="المجال (مثال: عيادات تجميل)" 
          className="h-12 w-full sm:w-56 rounded-lg border border-white/10 bg-slate-950/50 px-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input 
          type="text" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="المدينة (مثال: الرياض)" 
          className="h-12 w-full sm:w-40 rounded-lg border border-white/10 bg-slate-950/50 px-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={isSearching}
          className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          <span>تفعيل الصائد</span>
        </button>
      </form>
      
      {message && (
        <div className="text-xs font-medium text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/20 max-w-lg">
          {message}
        </div>
      )}
    </div>
  );
}
