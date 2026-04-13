import { Suspense } from "react";
import LensPublicClient from "./LensPublicClient";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default function LensPublicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
        <p className="text-slate-400">جاري تحميل LENS Engine...</p>
      </div>
    }>
      <LensPublicClient />
    </Suspense>
  );
}
