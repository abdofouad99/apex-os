import prisma from "@/lib/prisma";
import GhostSearchClient from "./GhostSearchClient";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const competitors = await prisma.competitor.findMany({
    orderBy: { lastScrapedAt: 'desc' },
    include: { 
      ads: {
        orderBy: { startDate: 'desc' }
      }
    }
  });

  const hasToken = !!process.env.APIFY_API_TOKEN;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 dir-rtl font-cairo" dir="rtl">
      {/* 
        Header Title
        For global layouts like Predator / Ghost, keeping title in client or layout feels right. 
        We pass the title layout context within the client or just render directly
      */}
      <div className="w-full max-w-7xl mx-auto mb-6">
         <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center gap-4">
            <span className="text-4xl text-purple-500">👻</span> مراقبة المنافسين (GHOST)
         </h1>
         <p className="text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
           يسمح لك نظام التجسس الخفي بتتبع الإعلانات المستهدفة التي يطلقها منافسوك عبر منصات التواصل (Meta/Instagram)، وعرض النصوص والصور المستخدمة للتفوق عليهم.
         </p>
      </div>

      <GhostSearchClient initialCompetitors={competitors} hasToken={hasToken} />
    </div>
  );
}
