export const dynamic = 'force-dynamic';
export const revalidate = 0;

import prisma from "@/lib/prisma";
import PredatorClient from "./PredatorClient";

export default async function LeadsPage() {
  let leads: any[] = [];
  try {
    leads = await prisma.lead.findMany({ orderBy: { score: "desc" } });
  } catch {
    // DB unavailable — show empty state
  }

  const hasToken = !!process.env.APIFY_API_TOKEN;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-8 dir-rtl" dir="rtl">
      <PredatorClient initialLeads={leads} hasToken={hasToken} />
    </div>
  );
}
