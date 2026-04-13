import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startAdsScraping, checkGhostRunStatus, getAdsResults, extractPageName, detectPlatform } from "@/services/ghost/apify-ghost";
import { analyzeAd } from "@/services/ghost/ad-analyzer";
import { getMockAdsResults } from "@/services/ghost/mock-ads";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pageUrl, runId } = body;
    const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

    // We must find a user to link Competitor to since we mapped it userId -> User
    // Find the first user in DB, or create a dummy one if none exists (MVP fallback)
    let user = await prisma.user.findFirst();
    if (!user) {
      const defaultAgency = await prisma.agency.create({ data: { name: "APEX Default" } });
      user = await prisma.user.create({
        data: {
          email: "admin@apex.local",
          name: "Admin User",
          agencyId: defaultAgency.id
        }
      });
    }

    // 1. Polling mode: check status & sync data
    if (runId) {
      if (runId.startsWith("mock-")) {
        const results = await getMockAdsResults();
        await saveGhostResultsToDB(results, pageUrl || "http://mock-page.com", user.id);
        return NextResponse.json({ message: "تم جلب البيانات الوهمية بنجاح", status: "COMPLETED", success: true });
      }

      const { status, defaultDatasetId } = await checkGhostRunStatus(runId);
      
      if (status !== "SUCCEEDED" && status !== "FINISHED") {
        return NextResponse.json({ message: "Job is running", status, success: true });
      }

      const results = await getAdsResults(defaultDatasetId);
      await saveGhostResultsToDB(results, pageUrl, user.id);

      return NextResponse.json({ message: `تم جلب (${results.length}) إعلان بنجاح`, status: "COMPLETED", success: true });
    }

    // 2. Start NEW run
    if (pageUrl) {
      const isDemoUrl = pageUrl.toLowerCase().includes('apple') || pageUrl.toLowerCase().includes('nike');

      // FORCE MOCK FOR DEMO URLs OR IF NO TOKEN
      if (!APIFY_TOKEN || isDemoUrl) {
        return NextResponse.json({
          message: "بدء التجسس الوهمي السريع (Demo Mode)",
          runId: `mock-${Date.now()}`,
          success: true
        });
      }

      try {
        const newRunId = await startAdsScraping(pageUrl);
        return NextResponse.json({
          message: "Ghost sent to hunt.",
          runId: newRunId,
          success: true
        });
      } catch (apifyError: any) {
        console.warn("Apify scraping failed, falling back to mock mode.", apifyError.message);
        // Fallback to mock mode if actor not found or error
        return NextResponse.json({
          message: "تعذر الاتصال بـ Apify، تم تفعيل وضع التدريب الوهمي (Demo Mode)",
          runId: `mock-${Date.now()}`,
          success: true
        });
      }
    }

  } catch (error: any) {
    console.error("GHOST Sync API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function saveGhostResultsToDB(results: any[], pageUrl: string, userId: string) {
  const validAds = results.filter(ad => !ad.error && !ad.errorDescription);
  if (validAds.length === 0) return 0;
  
  const pageName = validAds[0]?.pageName || extractPageName(pageUrl);
  const platform = detectPlatform(pageUrl);
  const activeCount = validAds.filter(ad => ad.isActive).length;

  // UPSERT Competitor
  const competitor = await prisma.competitor.upsert({
    where: {
      pageUrl_userId: {
        pageUrl: pageUrl,
        userId: userId
      }
    },
    update: {
      name: pageName,
      platform,
      totalAdsFound: validAds.length,
      activeAdsCount: activeCount,
      lastScrapedAt: new Date(),
      status: "COMPLETED"
    },
    create: {
      name: pageName,
      pageUrl,
      platform,
      totalAdsFound: validAds.length,
      activeAdsCount: activeCount,
      lastScrapedAt: new Date(),
      status: "COMPLETED",
      userId
    }
  });

  // Save Ads
  for (const ad of validAds) {
    if (!ad.adText && !ad.imageUrl && !ad.videoUrl) continue;

    const insights = analyzeAd(ad.adText);

    await prisma.competitorAd.create({
      data: {
        competitorId: competitor.id,
        adId: ad.adId || null,
        bodyText: ad.adText || null,
        imageUrl: ad.imageUrl || null,
        videoUrl: ad.videoUrl || null,
        isActive: ad.isActive ?? true,
        startDate: ad.startDate ? new Date(ad.startDate) : null,
        platform,
        hasOffer: insights.hasOffer,
        offerText: insights.offerText,
        hookScore: insights.hookScore,
        sentiment: insights.sentiment,
        mainTopic: insights.mainTopic
      }
    });
  }

  return results.length;
}

export async function GET() {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { lastScrapedAt: 'desc' },
      include: {
        ads: {
          orderBy: { startDate: 'desc' },
          take: 50
        }
      }
    });
    return NextResponse.json({ competitors, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
