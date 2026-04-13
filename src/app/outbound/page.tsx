import { Suspense } from "react";
import StrikerClient from "./StrikerClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OutboundPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>}>
      <StrikerClient />
    </Suspense>
  );
}
