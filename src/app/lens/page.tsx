import { Suspense } from "react";
import LensInternalClient from "./LensInternalClient";
import { Loader2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default function LensInternalPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/30" /></div>}>
      <LensInternalClient />
    </Suspense>
  );
}
