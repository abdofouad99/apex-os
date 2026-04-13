import { Suspense } from "react";
import ResearchClient from "./ResearchClient";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";
export default function ResearchPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>}><ResearchClient /></Suspense>;
}
