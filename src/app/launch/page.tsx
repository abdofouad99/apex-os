import { Suspense } from "react";
import LaunchClient from "./LaunchClient";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";
export default function LaunchPage() {
  return <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>}><LaunchClient /></Suspense>;
}
