export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractPageName, detectPlatform } from "@/services/ghost/apify-ghost";
import { runApifyWithRotation } from "@/lib/apify-rotator";



// ── Build Ads Library URL from page URL/slug ──
function buildAdsLibraryUrl(pageUrl: string, country = "ALL"): string {
  try {
    const url = new URL(pageUrl.startsWith("http") ? pageUrl : "https://" + pageUrl);
    const slug = url.pathname.split("/").filter(Boolean)[0] || "";
    // Use search_type=page to find page-specific ads
    return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country}&q=${encodeURIComponent(slug)}&search_type=page`;
  } catch {
    return `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=${encodeURIComponent(pageUrl)}&search_type=page`;
  }
}

// ── Parse Ads Library item format ──
function parseAd(item: any) {
  // Ads Library returns snapshot object with creative data
  const s = item.snapshot || {};
  
  // Extract ad text
  let adText = "";
  if (typeof s.body === "string") adText = s.body;
  else if (s.body?.markup?.__html) adText = s.body.markup.__html.replace(/<[^>]+>/g, "");
  else if (s.body?.text) adText = s.body.text;
  else adText = s.caption || s.link_description || s.title || "";
  
  // Extract image
  let imageUrl = "";
  if (s.images?.length > 0) {
    const img = s.images[0];
    imageUrl = img.original_image_url || img.resized_image_url || img.url || "";
  }
  if (!imageUrl && s.cards?.length > 0) {
    imageUrl = s.cards[0].original_image_url || s.cards[0].resized_image_url || "";
  }
  
  // Extract video
  let videoUrl = "";
  if (s.videos?.length > 0) {
    videoUrl = s.videos[0].video_hd_url || s.videos[0].video_sd_url || "";
    if (!imageUrl) imageUrl = s.videos[0].video_preview_image_url || "";
  }
  
  // Page name
  const pageName = item.page_name || s.page_name || "";
  
  // Active status
  const isActive = item.is_active === true || item.is_active === 1;
  
  // CTA
  const ctaText = s.cta_text || s.link_title || null;
  const linkUrl = s.link_url || s.page_profile_uri || null;

  // Spend/impressions
  const spend = item.spend ? `${item.spend.lower_bound || 0}-${item.spend.upper_bound || 0} ${item.currency || ""}` : null;

  return {
    adId: String(item.ad_archive_id || item.id || Math.random()),
    pageName,
    pageId: String(item.page_id || ""),
    adText: adText.substring(0, 1000),
    imageUrl,
    videoUrl,
    isActive,
    startDate: item.start_date_formatted || item.start_date || null,
    endDate: item.end_date_formatted || item.end_date || null,
    spend,
    ctaText,
    linkUrl,
    platforms: item.publisher_platform || [],
    adLibraryUrl: item.ad_library_url || null,
  };
}

// ── Find the target page's ads from search results ──
function filterPageAds(items: any[], searchSlug: string): { ads: any[], foundPageId: string | null, foundPageName: string | null } {
  // Filter out error items
  const validItems = items.filter(i => !i.error && (i.ad_archive_id || i.id));
  
  if (validItems.length === 0) return { ads: [], foundPageId: null, foundPageName: null };
  
  // Try to find items matching our page slug
  const slug = searchSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // First try: exact match by page profile URL
  let matchedItems = validItems.filter(i => {
    const pageName = (i.page_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const profileUri = (i.snapshot?.page_profile_uri || "").toLowerCase();
    return pageName.includes(slug) || profileUri.includes(slug);
  });
  
  // If no exact match but we have results — group by page_id and take most common
  if (matchedItems.length === 0 && validItems.length > 0) {
    // Take the first page's ads as the most relevant result
    const firstPageId = validItems[0].page_id;
    matchedItems = validItems.filter(i => i.page_id === firstPageId);
  }
  
  const foundPageId = matchedItems[0]?.page_id || null;
  const foundPageName = matchedItems[0]?.page_name || null;
  
  console.log(`🎯 [Ghost] Filtered to ${matchedItems.length} ads for page: ${foundPageName}`);
  return { ads: matchedItems, foundPageId: String(foundPageId || ""), foundPageName };
}

// ── Save results to DB ──
async function saveAdsToDb(ads: any[], pageUrl: string, userId: string) {
  if (!ads.length) return 0;

  const pageName = ads[0]?.pageName || extractPageName(pageUrl);
  const platform = detectPlatform(pageUrl);
  const activeCount = ads.filter(a => a.isActive).length;

  const competitor = await prisma.competitor.upsert({
    where: { pageUrl_userId: { pageUrl, userId } },
    update: { name: pageName, platform, totalAdsFound: ads.length, activeAdsCount: activeCount, lastScrapedAt: new Date(), status: "COMPLETED" },
    create: { name: pageName, pageUrl, platform, totalAdsFound: ads.length, activeAdsCount: activeCount, lastScrapedAt: new Date(), status: "COMPLETED", userId }
  });

  await prisma.competitorAd.deleteMany({ where: { competitorId: competitor.id } });

  for (const ad of ads.slice(0, 50)) {
    await prisma.competitorAd.create({
      data: {
        competitorId: competitor.id,
        adId: ad.adId,
        bodyText: ad.adText || null,
        imageUrl: ad.imageUrl || null,
        videoUrl: ad.videoUrl || null,
        isActive: ad.isActive,
        startDate: ad.startDate ? new Date(ad.startDate) : null,
        platform,
        hasOffer: /خصم|عرض|مجاني|تخفيض|أوفر|offer|discount|free|sale/i.test(ad.adText || ""),
        offerText: null,
        hookScore: (ad.adText?.length || 0) > 50 ? 7 : 4,
        sentiment: "neutral",
        mainTopic: null,
      }
    });
  }

  return ads.length;
}

// ─────────────────────────────────────────
// POST — جلب إعلانات حقيقية
// ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { pageUrl } = await req.json();
    if (!pageUrl) return NextResponse.json({ error: "pageUrl مطلوب" }, { status: 400 });
    if (!process.env.APIFY_API_TOKEN) return NextResponse.json({ error: "APIFY_API_TOKEN غير مهيأ" }, { status: 500 });

    // Extract slug
    const cleanUrl = pageUrl.startsWith("http") ? pageUrl : "https://" + pageUrl;
    const urlObj = new URL(cleanUrl);
    const slug = urlObj.pathname.split("/").filter(Boolean)[0] || pageUrl;
    
    // DB (optional - won't fail if unreachable)
    let userId = "local";
    try {
      let user = await prisma.user.findFirst();
      if (!user) {
        const ag = await prisma.agency.create({ data: { name: "APEX Default" } });
        user = await prisma.user.create({ data: { email: "admin@apex.local", name: "Admin", agencyId: ag.id } });
      }
      userId = user.id;
    } catch (dbErr: any) {
      console.warn("⚠️ DB unavailable, continuing without persistence:", dbErr.message.substring(0, 100));
    }
    
    // Build proper Ads Library URL
    const adsLibUrl = buildAdsLibraryUrl(cleanUrl);
    console.log(`👻 Ghost: Scraping ads lib URL: ${adsLibUrl}`);

    const rawItems = await runApifyWithRotation("curious_coder/facebook-ads-library-scraper", {
      urls: [{ url: adsLibUrl }],
      useApifyProxy: true,
      maxAds: 100
    }, 150);

    // Filter/find target page ads
    const { ads: filteredItems, foundPageId, foundPageName } = filterPageAds(rawItems, slug);
    
    // Parse ads
    const ads = filteredItems.map(parseAd).filter(a => a.adText || a.imageUrl || a.videoUrl);
    
    console.log(`✅ Ghost: Got ${ads.length} valid ads for "${foundPageName || slug}"`);

    // Check if all items are errors (no ads)
    const errorItem = rawItems.find(r => r.error || r.errorCode);
    const pageInfo = errorItem?.pageInfo || null;
    const adStatus = pageInfo?.ad_status || null;
    const noAds = ads.length === 0;

    // ── Fallback: No paid ads → fetch last 10 organic posts ──
    if (ads.length === 0) {
      console.log(`📄 Ghost: No paid ads found, falling back to organic posts for ${cleanUrl}`);
      
      try {
        const postsRaw = await runApifyWithRotation("apify/facebook-posts-scraper", {
          startUrls: [{ url: cleanUrl }],
          resultsLimit: 10
        }, 120);

        if (postsRaw.length > 0) {
          const posts = postsRaw.map((p: any, i: number) => {
            // Safe date conversion
            let startDate: string | null = null;
            try {
              if (p.time && !isNaN(p.time)) {
                const d = new Date(Number(p.time) * 1000);
                if (!isNaN(d.getTime())) startDate = d.toISOString();
              } else if (p.timestamp) {
                startDate = String(p.timestamp);
              }
            } catch { startDate = null; }

            return {
              adId: `post-${p.postId || p.facebookId || i}`,
              pageName: p.pageName || p.user?.name || slug,
              pageId: p.facebookId || "",
              adText: (p.text || p.message || "").substring(0, 1000),
              imageUrl: p.media?.[0]?.thumbnail || p.media?.[0]?.image?.uri || "",
              videoUrl: p.isVideo ? (p.media?.[0]?.url || "") : "",
              isActive: true,
              startDate,
              endDate: null,
              spend: null,
              ctaText: null,
              linkUrl: p.url || p.topLevelUrl || null,
              platforms: ["facebook"],
              adLibraryUrl: null,
              isOrganic: true,
              likes: p.likes || 0,
              comments: p.comments || 0,
              shares: p.shares || 0,
            };
          }).filter((p: any) => p.adText || p.imageUrl);



          console.log(`✅ Ghost: Got ${posts.length} organic posts as fallback`);


          return NextResponse.json({
            success: true,
            pageUrl: cleanUrl,
            pageName: postsRaw[0]?.pageName || slug,
            totalAds: 0,
            activeAds: 0,
            totalPosts: posts.length,
            ads: posts,
            pageInfo,
            adStatus,
            pageId: foundPageId,
            isOrganicFallback: true,
            noAdsReason: adStatus || "لا توجد إعلانات مدفوعة — يتم عرض آخر المنشورات بدلاً منها"
          });
        }
      } catch (postErr: any) {
        console.warn(`⚠️ Posts fallback failed: ${postErr.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      pageUrl: cleanUrl,
      pageName: foundPageName || ads[0]?.pageName || slug,
      totalAds: ads.length,
      activeAds: ads.filter(a => a.isActive).length,
      ads: ads.slice(0, 50),
      pageInfo,
      adStatus,
      pageId: foundPageId,
      isOrganicFallback: false,
      noAdsReason: ads.length === 0 ? (adStatus || "لم يُعثر على إعلانات لهذه الصفحة") : null
    });

  } catch (error: any) {
    console.error("Ghost sync error:", error.message);
    if (error.message === "APIFY_QUOTA_EXCEEDED") {
      return NextResponse.json({
        error: "APIFY_QUOTA_EXCEEDED",
        message: "نفد رصيد Apify الشهري. يتجدد مطلع الشهر القادم أو يمكنك رفع الحصة من apify.com"
      }, { status: 402 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

}

// ─────────────────────────────────────────
// GET — جلب الإعلانات المحفوظة
// ─────────────────────────────────────────
export async function GET() {
  try {
    const competitors = await prisma.competitor.findMany({
      orderBy: { lastScrapedAt: "desc" },
      include: { ads: { orderBy: { startDate: "desc" }, take: 50 } }
    });
    return NextResponse.json({ competitors, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
