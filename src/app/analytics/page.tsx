import { Suspense } from "react";
import VaultClient from "./VaultClient";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";
export default function AnalyticsPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>}><VaultClient /></Suspense>;
}
