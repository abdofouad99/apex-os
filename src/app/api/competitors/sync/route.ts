export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startAdsScraping, checkGhostRunStatus, getAdsResults } from "@/services/ghost/apify-ghost";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { datasetId, competitorId, competitorUrl } = body;

    // STEP 1: Triggering a new run
    if (competitorUrl && competitorId) {
      // Trigger scraping on Meta Ads Library for this specific competitor URL
      const runId = await startAdsScraping(competitorUrl);

      // Check run status with polling
      let status = "RUNNING";
      let attempts = 0;
      let defaultDatasetId = "";

      while (status === "RUNNING" || status === "READY") {
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
        if (attempts > 24) {
          console.warn("⚠️ Competitors: Apify timeout after 120s");
          break;
        }

        const statusRes = await checkGhostRunStatus(runId);
        status = statusRes.status;
        defaultDatasetId = statusRes.defaultDatasetId;

        if (status === "SUCCEEDED") break;
        if (status === "FAILED" || status === "ABORTED") {
          throw new Error(`Apify run ${status}`);
        }
      }

      if (status !== "SUCCEEDED" || !defaultDatasetId) {
        return NextResponse.json(
          { error: "فشل في جلب بيانات المنافس. يرجى المحاولة لاحقاً." },
          { status: 503 }
        );
      }

      // Fetch and save results immediately
      const results = await getAdsResults(defaultDatasetId);
      let newAdsCount = 0;

      for (const ad of results) {
        if (!ad.adText && !ad.imageUrl) continue;

        await prisma.competitorAd.create({
          data: {
            competitorId: competitorId,
            bodyText: ad.adText || null,
            imageUrl: ad.imageUrl || null,
            videoUrl: ad.videoUrl || null,
            startDate: ad.startDate ? new Date(ad.startDate) : new Date(),
            isActive: ad.status === "ACTIVE",
            platform: "facebook",
            adId: ad.adId || null,
          }
        });

        newAdsCount++;
      }

      // Update the competitor record
      await prisma.competitor.update({
        where: { id: competitorId },
        data: { lastScrapedAt: new Date() },
      });

      return NextResponse.json({
        message: `Ghost found ${newAdsCount} ad creatives for competitor.`,
        runId: runId,
        adsFound: newAdsCount,
        success: true
      });
    }

    // STEP 2: Fetching the data by datasetId (separate call)
    if (datasetId && competitorId) {
      const results = await getAdsResults(datasetId);
      let newAdsCount = 0;

      for (const ad of results) {
        if (!ad.adText && !ad.imageUrl) continue;

        await prisma.competitorAd.create({
          data: {
            competitorId: competitorId,
            bodyText: ad.adText || null,
            imageUrl: ad.imageUrl || null,
            videoUrl: ad.videoUrl || null,
            startDate: ad.startDate ? new Date(ad.startDate) : new Date(),
            isActive: ad.status === "ACTIVE",
            platform: "facebook",
            adId: ad.adId || null,
          }
        });

        newAdsCount++;
      }

      return NextResponse.json({
        message: `Ghost recovered ${newAdsCount} ad creatives.`,
        success: true
      });
    }

    return NextResponse.json({ error: "Missing required parameters (competitorUrl or datasetId)" }, { status: 400 });

  } catch (error: any) {
    console.error("Ghost Sync API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
