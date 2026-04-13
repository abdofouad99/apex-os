import { Suspense } from "react";
import PulseClient from "./PulseClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function GrowthPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>}>
      <PulseClient />
    </Suspense>
  );
}
