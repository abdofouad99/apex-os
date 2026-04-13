import prisma from "@/lib/prisma";
import PredatorClient from "./PredatorClient";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { score: 'desc' }
  });

  const hasToken = !!process.env.APIFY_API_TOKEN;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-8 dir-rtl" dir="rtl">
      <PredatorClient initialLeads={leads} hasToken={hasToken} />
    </div>
  );
}
