export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startGoogleMapsSearch, getRunResults, checkRunStatus, ApifyMapLead } from "@/services/predator/apify-client";
import { calculateLeadScore } from "@/services/predator/scoring";
import { getMockRunResults } from "@/services/predator/mock-data";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { keyword, city, runId } = body;
    
    const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

    // حالة 1: التحقق من نتيجة مسح قائم (Polling)
    if (runId) {
      if (runId.startsWith("mock-")) {
        const results = await getMockRunResults();
        await saveResultsToDB(results, keyword, city);
        return NextResponse.json({ message: `تم جلب (${results.length}) نتيجة وهمية بنجاح`, status: "COMPLETED", success: true });
      }

      const { status, defaultDatasetId } = await checkRunStatus(runId);
      
      if (status !== "SUCCEEDED" && status !== "FINISHED") {
        return NextResponse.json({ message: "Job is still running", status, success: true });
      }

      // إذا انتهت العمليات، نجلب النتائج ونحفظها في DB
      const results = await getRunResults(defaultDatasetId);
      await saveResultsToDB(results, keyword, city);

      return NextResponse.json({ message: `تم الاستخراج بنجاح (${results.length} عميل)`, status: "COMPLETED", success: true });
    }

    // حالة 2: بدء مسح جديد (NEW RUN)
    if (keyword && city) {
      if (!APIFY_TOKEN) {
        // إذا لم يوجد توكن، نشغل الـ Mock
        return NextResponse.json({ 
          message: "بدء المسح الوهمي (لا يوجد مفتاح Apify)", 
          runId: `mock-${Date.now()}`, 
          success: true 
        });
      }

      const newRunId = await startGoogleMapsSearch(keyword, city);
      return NextResponse.json({ 
        message: "Scraping job started.", 
        runId: newRunId, 
        success: true 
      });
    }

    return NextResponse.json({ error: "Missing required parameters (keyword/city or runId)" }, { status: 400 });

  } catch (error: any) {
    console.error("Leads Sync API Error:", error);
    if (error.message === "APIFY_QUOTA_EXCEEDED") {
      return NextResponse.json({
        error: "APIFY_QUOTA_EXCEEDED",
        message: "نفد رصيد Apify الشهري. يتجدد مطلع الشهر القادم أو يمكنك الاستمرار بالوضع الوهمي"
      }, { status: 402 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function saveResultsToDB(results: ApifyMapLead[], keyword: string, city: string) {
  let count = 0;
  for (const lead of results) {
    if (!lead.title) continue;

    const scoreResult = calculateLeadScore({
      hasWebsite: !!lead.website,
      hasPhone: !!lead.phone,
      rating: lead.rating,
      reviewsCount: lead.reviewsCount
    });

    await prisma.lead.create({
      data: {
        companyName: lead.title,
        contactEmail: lead.website || null,
        contactPhone: lead.phone || null,
        websiteUrl: lead.website || null,
        rating: lead.rating || null,
        reviewsCount: lead.reviewsCount || 0,
        industry: lead.categoryName || keyword || null,
        city: lead.city || city || null,
        googleMapsUrl: lead.url || null,
        source: "Apify Maps API",
        score: scoreResult.score,
        scoreLabel: scoreResult.label,
        lastSyncAt: new Date()
      }
    });
    count++;
  }
  return count;
}
