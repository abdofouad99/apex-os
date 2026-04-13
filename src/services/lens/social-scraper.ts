/**
 * LENS ENGINE - Real Social Media Scraping
 * Facebook + Instagram + TikTok + X
 * Uses: Apify (when available) + Free Public APIs
 */
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_GHOST_ACTOR = process.env.APIFY_GHOST_ACTOR_ID || "curious_coder~facebook-ads-library-scraper";

export interface SocialProfileData {
  platform: "instagram" | "tiktok" | "x" | "facebook";
  username: string;
  displayName?: string;
  bio?: string;
  followers?: number;
  following?: number;
  postsCount?: number;
  engagementRate?: string;
  avgLikes?: number;
  avgComments?: number;
  profilePicUrl?: string;
  isVerified?: boolean;
  externalUrl?: string;
  recentPosts: Array<{
    caption?: string;
    likes?: number;
    comments?: number;
    timestamp?: string;
    mediaType?: "image" | "video" | "carousel";
  }>;
  bioQuality: string;
  contentQuality: string;
}

export interface FacebookAdsData {
  adsCount: number;
  activeAdsCount: number;
  inactiveAdsCount: number;
  platforms: string[];
  adCategories: string[];
  topAdFormats: string[];
  advertiserName?: string;
  pageId?: string;
  pageLikeCount?: number;
  firstSeen?: string;
  lastSeen?: string;
  sampleAds: Array<{
    adText?: string;
    imageUrl?: string;
    videoUrl?: string;
    videoPreviewUrl?: string;
    startDate?: string;
    status?: string;
    platform?: string;
    ctaText?: string;
    linkUrl?: string;
    pageName?: string;
    pageCategory?: string;
  }>;
}

// ── Main Entry Point ──

export async function scrapeSocialProfile(platformUrl: string): Promise<SocialProfileData> {
  const platform = detectPlatform(platformUrl);
  console.log(`🔍 LENS: Detected platform: ${platform}`);

  let data: Partial<SocialProfileData>;

  switch (platform) {
    case "facebook":
      data = await scrapeFacebook(platformUrl);
      break;
    case "x":
      data = await scrapeX(platformUrl);
      break;
    case "tiktok":
      data = await scrapeTikTok(platformUrl);
      break;
    case "instagram":
      data = await scrapeInstagram(platformUrl);
      break;
    default:
      data = { username: "unknown", platform: platform as any };
  }

  const bio = data.bio || "";
  const bioQuality = analyzeBioQuality(bio, platform);
  const contentQuality = data.contentQuality || analyzeContentQuality(data, platform);

  return {
    platform: platform as SocialProfileData["platform"],
    username: data.username || extractUsername(platformUrl),
    displayName: data.displayName,
    bio,
    followers: data.followers || 0,
    following: data.following,
    postsCount: data.postsCount,
    engagementRate: data.engagementRate,
    avgLikes: data.avgLikes,
    avgComments: data.avgComments,
    profilePicUrl: data.profilePicUrl,
    isVerified: data.isVerified,
    externalUrl: data.externalUrl,
    recentPosts: data.recentPosts || [],
    bioQuality,
    contentQuality
  };
}

// ── Facebook via Apify Ads Library Scraper ──

async function scrapeFacebook(url: string): Promise<Partial<SocialProfileData>> {
  // Normalize URL to full Facebook page URL
  const normalizedUrl = normalizeFacebookUrl(url);
  const pageName = extractUsername(normalizedUrl);
  console.log(`📘 Facebook: Normalized URL: ${normalizedUrl}, Page: ${pageName}`);

  // Try Apify Facebook Ads Library Scraper
  if (APIFY_TOKEN) {
    try {
      const adsData = await scrapeFacebookAds(normalizedUrl);
      if (adsData && adsData.adsCount > 0) {
        console.log(`✅ Facebook: Got ${adsData.adsCount} ads from Apify for ${pageName}`);

        // Analyze ad content quality
        const adAnalysis = analyzeAdsData(adsData);

        return {
          platform: "facebook",
          username: pageName,
          displayName: adsData.advertiserName || pageName,
          followers: adsData.pageLikeCount,
          bioQuality: analyzeBioQuality("", "facebook"),
          contentQuality: adAnalysis,
          postsCount: adsData.adsCount,
          recentPosts: adsData.sampleAds.slice(0, 10).map(ad => ({
            caption: ad.adText || ad.pageCategory || `${ad.platform || "Facebook"} ${ad.status} Ad`,
            mediaType: ad.videoUrl ? "video" : "image",
            timestamp: ad.startDate
          }))
        };
      } else if (adsData && adsData.adsCount === 0) {
        console.log(`ℹ️ Facebook: Page exists but has 0 ads in Ad Library`);
        return {
          platform: "facebook",
          username: pageName,
          displayName: adsData.advertiserName || pageName,
          followers: adsData.pageLikeCount,
          contentQuality: "هذه الصفحة لا تشغل إعلانات حالياً — يحتاج تحليل المحتوى العضوي",
          postsCount: 0,
          recentPosts: []
        };
      }
    } catch (e: any) {
      console.warn("⚠️ Apify Facebook Ads failed:", e.message);
    }
  }

  // Fallback
  console.log(`ℹ️ Facebook: Using intelligent analysis for ${pageName}`);
  return {
    platform: "facebook",
    username: pageName,
    bioQuality: "يحتاج فحص يدوي للصفحة",
    contentQuality: "يحتاج مراجعة يدوية"
  };
}

function normalizeFacebookUrl(url: string): string {
  // If it's just a page name
  if (!url.includes("facebook.com") && !url.includes("fb.com")) {
    return `https://www.facebook.com/${url}`;
  }
  // Add https:// if missing
  if (!url.startsWith("http")) {
    return `https://${url}`;
  }
  return url;
}

async function scrapeFacebookAds(pageUrl: string): Promise<FacebookAdsData | null> {
  if (!APIFY_TOKEN || !APIFY_GHOST_ACTOR) return null;

  // Start the Apify run
  console.log(`🚀 Apify: Starting Facebook Ads scrape for ${pageUrl}`);
  console.log(`📋 Apify Actor: ${APIFY_GHOST_ACTOR}`);

  const payload = {
    urls: [{ url: pageUrl }],
    activeStatus: "all",
    useApifyProxy: true,
    maxAds: 50
  };

  console.log(`📤 Apify Payload:`, JSON.stringify(payload).substring(0, 200));

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_GHOST_ACTOR}/runs?token=${APIFY_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  if (!runRes.ok) {
    const errorText = await runRes.text();
    console.error(`❌ Apify run failed: ${runRes.status} ${errorText}`);
    throw new Error(`Apify run failed: ${runRes.status} ${errorText}`);
  }

  const { data: runData } = await runRes.json();
  const runId = runData.id;
  console.log(`📋 Apify: Run started: ${runId}`);

  // Poll for completion (max 120s)
  let status = "RUNNING";
  let attempts = 0;
  let defaultDatasetId = runData.defaultDatasetId;
  const maxAttempts = 24; // 24 * 5s = 120s

  while (status === "RUNNING" || status === "READY") {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;

    if (attempts >= maxAttempts) {
      console.warn("⚠️ Apify: Timeout after 120s, checking partial results...");
      break;
    }

    try {
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      const { data: statusData } = await statusRes.json();
      status = statusData.status;
      defaultDatasetId = statusData.defaultDatasetId || defaultDatasetId;
      console.log(`📊 Apify: Status: ${status} (attempt ${attempts}/${maxAttempts})`);

      if (status === "SUCCEEDED") break;
      if (status === "FAILED" || status === "ABORTED") {
        throw new Error(`Apify run ${status}`);
      }
    } catch (e: any) {
      if (e.message.includes("Apify run")) throw e;
      console.warn("⚠️ Apify: Status check failed, retrying:", e.message);
    }
  }

  // Fetch results
  if (!defaultDatasetId) {
    console.error("❌ Apify: No defaultDatasetId available after run");
    return null;
  }

  console.log(`📥 Apify: Fetching results from dataset ${defaultDatasetId}`);
  const resultsRes = await fetch(
    `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${APIFY_TOKEN}&limit=50`
  );

  if (!resultsRes.ok) {
    throw new Error(`Failed to fetch results: ${resultsRes.status} ${await resultsRes.text()}`);
  }

  const items = await resultsRes.json();
  console.log(`📦 Apify: Got ${items.length} items`);

  if (items.length === 0) return null;

  // Process results
  const firstItem = items[0];
  const snapshot = firstItem?.snapshot || firstItem;

  const adsData: FacebookAdsData = {
    adsCount: items.length,
    activeAdsCount: items.filter((i: any) => {
      const s = i.status || i.isActive || i.is_active;
      return s === "ACTIVE" || s === true;
    }).length,
    inactiveAdsCount: items.filter((i: any) => {
      const s = i.status || i.isActive || i.is_active;
      return s !== "ACTIVE" && s !== true;
    }).length,
    platforms: [...new Set(items.map((i: any) =>
      i.platform || i.publisherPlatform || i.snapshot?.platform
    ).filter(Boolean))] as string[],
    adCategories: [...new Set(items.flatMap((i: any) => {
      const s = i.snapshot || i;
      return s.page_categories || s.categories || i.adCategories || i.interests || [];
    }).filter(Boolean))] as string[],
    topAdFormats: [...new Set(items.map((i: any) => {
      const s = i.snapshot || i;
      return s.display_format || i.mediaType || i.format || (s.videos?.length ? "VIDEO" : "IMAGE");
    }).filter(Boolean))] as string[],
    advertiserName: snapshot.page_name || firstItem.pageName || firstItem.advertiserName || firstItem.page_name,
    pageId: firstItem.page_id,
    firstSeen: items[items.length - 1]?.start_date || items[items.length - 1]?.startDate,
    lastSeen: items[0]?.start_date || items[0]?.startDate,
    pageLikeCount: snapshot.page_like_count,
    sampleAds: items.slice(0, 15).map((item: any) => {
      const s = item.snapshot || item;
      
      // Extract body text - can be string, object with text property, or null
      let adText = '';
      if (typeof s.body === 'string') adText = s.body;
      else if (s.body && typeof s.body === 'object') adText = s.body.text || '';
      else adText = item.adText || item.primaryText || item.text || item.caption || '';

      // Extract image URL
      let imageUrl = '';
      if (s.images && s.images.length > 0) {
        const img = s.images[0];
        imageUrl = img.original_image_url || img.url || img.image_url || '';
      }
      if (!imageUrl) {
        imageUrl = item.imageUrl || item.thumbnailUrl || '';
      }

      // Extract video URL
      let videoUrl = '';
      let videoPreviewUrl = '';
      if (s.videos && s.videos.length > 0) {
        const vid = s.videos[0];
        videoUrl = vid.video_sd_url || vid.video_hd_url || vid.url || '';
        videoPreviewUrl = vid.video_preview_image_url || '';
      }
      if (!videoUrl) {
        videoUrl = item.videoUrl || '';
      }
      if (!videoPreviewUrl) {
        videoPreviewUrl = item.videoPreviewUrl || '';
      }

      // Extract categories
      const categories = s.page_categories || s.categories || item.adCategories || item.interests || [];

      return {
        adText,
        imageUrl,
        videoUrl,
        videoPreviewUrl,
        startDate: item.start_date || item.startDate,
        status: (item.isActive || item.active) ? "ACTIVE" : "INACTIVE",
        platform: item.platform || item.publisherPlatform,
        ctaText: s.cta_text || item.ctaText || '',
        linkUrl: s.link_url || item.linkUrl || '',
        pageName: s.page_name || item.pageName || '',
        pageCategory: Array.isArray(categories) ? categories.join(", ") : ''
      };
    })
  };

  console.log(`📊 Apify: Extracted ${adsData.adsCount} ads, page likes: ${adsData.pageLikeCount}, name: ${adsData.advertiserName}`);
  if (adsData.sampleAds.length > 0) {
    console.log(`📋 First ad text:`, adsData.sampleAds[0].adText?.substring(0, 100) || "(empty)");
  }

  return adsData;
}

function analyzeAdsData(ads: FacebookAdsData): string {
  const parts: string[] = [];

  // Page authority
  if (ads.pageLikeCount) {
    if (ads.pageLikeCount > 1_000_000) {
      parts.push(`صفحة ضخمة (${(ads.pageLikeCount / 1_000_000).toFixed(1)}M متابع)`);
    } else if (ads.pageLikeCount > 100_000) {
      parts.push(`صفحة كبيرة (${(ads.pageLikeCount / 1_000).toFixed(0)}K متابع)`);
    } else if (ads.pageLikeCount > 10_000) {
      parts.push(`صفحة متوسطة الحجم (${ads.pageLikeCount.toLocaleString()} متابع)`);
    }
  }

  // Overall activity
  if (ads.activeAdsCount > 20) {
    parts.push("نشط جداً في الإعلانات");
  } else if (ads.activeAdsCount > 5) {
    parts.push("نشط في الإعلانات بشكل متوسط");
  } else if (ads.activeAdsCount > 0) {
    parts.push("إعلاناته محدودة");
  } else {
    parts.push("لا يوجد إعلانات نشطة حالياً ⚠️");
  }

  // Platforms
  if (ads.platforms.length > 0) {
    parts.push(`ينشر على: ${ads.platforms.join("، ")}`);
  }

  // Ad formats
  if (ads.topAdFormats.length > 0) {
    parts.push(`صيغ الإعلان: ${ads.topAdFormats.join("، ")}`);
  }

  // Categories
  if (ads.adCategories.length > 0) {
    parts.push(`التصنيفات: ${ads.adCategories.slice(0, 3).join("، ")}`);
  }

  // Issues
  if (ads.inactiveAdsCount > ads.activeAdsCount && ads.activeAdsCount > 0) {
    parts.push("معظم الإعلانات متوقفة — يحتاج مراجعة الاستراتيجية");
  }

  // CTA analysis
  const adsWithCTA = ads.sampleAds.filter(ad => ad.ctaText).length;
  if (adsWithCTA === 0 && ads.sampleAds.length > 0) {
    parts.push("ينقصه Call to Action في الإعلانات");
  } else if (adsWithCTA > 0) {
    parts.push(`يستخدم CTA في ${adsWithCTA} من ${ads.sampleAds.length} إعلانات`);
  }

  return parts.join(" | ");
}

// ── X (Twitter) via FxTwitter / VxTwitter (Free, No Auth) ──

async function scrapeX(url: string): Promise<Partial<SocialProfileData>> {
  const username = extractUsername(url);

  // Try FxTwitter first
  try {
    const res = await fetch(`https://api.fxtwitter.com/${username}`, {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      const u = data?.user;
      if (u) {
        console.log(`✅ X: Got data from FxTwitter for @${username}`);
        return {
          platform: "x",
          username: u.screen_name || username,
          displayName: u.name,
          bio: u.description,
          followers: u.followers_count,
          following: u.friends_count,
          postsCount: u.statuses_count,
          isVerified: u.verified || u.is_blue_verified || false,
          profilePicUrl: u.profile_image_url,
          externalUrl: u.url || u.entities?.url?.urls?.[0]?.expanded_url,
          recentPosts: []
        };
      }
    }
  } catch (e) {
    console.warn("⚠️ FxTwitter failed:", (e as Error).message);
  }

  // Fallback: VxTwitter
  try {
    const res = await fetch(`https://api.vxtwitter.com/${username}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ X: Got data from VxTwitter for @${username}`);
      return {
        platform: "x",
        username: data.handle || username,
        displayName: data.name,
        bio: data.description,
        followers: data.followers,
        postsCount: data.posts,
        isVerified: true,
        recentPosts: []
      };
    }
  } catch (e) {
    console.warn("⚠️ VxTwitter failed:", (e as Error).message);
  }

  console.warn(`⚠️ X: All APIs failed for @${username}`);
  return { platform: "x", username };
}

// ── TikTok via oEmbed (Free, No Auth) ──

async function scrapeTikTok(url: string): Promise<Partial<SocialProfileData>> {
  const username = extractUsername(url);

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${username}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      console.log(`✅ TikTok: Got oEmbed data for @${username}`);
      return {
        platform: "tiktok",
        username,
        displayName: data.author_name || username,
        profilePicUrl: `https://www.tiktok.com/@${username}/avatar`,
        recentPosts: []
      };
    }
  } catch (e) {
    console.warn("⚠️ TikTok oEmbed failed:", (e as Error).message);
  }

  return { platform: "tiktok", username };
}

// ── Instagram (limited, uses intelligent analysis) ──

async function scrapeInstagram(url: string): Promise<Partial<SocialProfileData>> {
  const username = extractUsername(url);
  console.log(`ℹ️ Instagram: Using intelligent analysis for @${username}`);

  return {
    platform: "instagram",
    username,
    bioQuality: "يحتاج فحص يدوي (Instagram يمنع السحب التلقائي)",
    contentQuality: "يحتاج مراجعة يدوية"
  };
}

// ── Quality Analysis Helpers ──

function analyzeBioQuality(bio: string, platform: string): string {
  if (!bio || bio.length < 10) {
    if (platform === "facebook") {
      return "يحتاج فحص يدوي لصفحة الفيسبوك — لا يوجد bio مباشر";
    }
    return "البايو فارغ أو قصير جداً — أولوية قصوى: أضف عرض القيمة";
  }

  let score = 0;
  let maxScore = 5;

  if (/\d/.test(bio)) score++;
  if (/http|link|رابط|🔗|👇|⬇️/i.test(bio)) score++;
  if (bio.length > 50 && bio.length < 150) score++;
  if (/ساعد|نساعد|نبني|نقدم|تعلم|نمو|help|build|create|grow/i.test(bio)) score++;
  if (/مؤسس|مدير|خبير|CEO|Founder|Owner|Director/i.test(bio)) score++;

  const ratio = score / maxScore;
  if (ratio >= 0.8) return "ممتاز — البايو يعكس عرض القيمة بوضوح مع CTA قوي";
  if (ratio >= 0.6) return "جيد — البايو مقبول لكن ينقصه Call to Action";
  if (ratio >= 0.4) return "متوسط — البايو يحتاج تحسين واضح";
  return "ضعيف — لا يعكس عرض القيمة بوضوح";
}

function analyzeContentQuality(data: Partial<SocialProfileData>, platform: string): string {
  const posts = data.recentPosts || [];
  if (posts.length === 0) {
    return `يحتاج مراجعة يدوية — ${platform} لا يوفر بيانات المنشورات عبر API مجاني`;
  }

  const avgLikes = posts.reduce((s, p) => s + (p.likes || 0), 0) / posts.length;
  const avgComments = posts.reduce((s, p) => s + (p.comments || 0), 0) / posts.length;

  return `متوسط ${avgLikes.toFixed(0)} لايك، ${avgComments.toFixed(0)} تعليق`;
}

// ── Utility ──

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  return "facebook";
}

function extractUsername(url: string): string {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const u = new URL(fullUrl);
    const path = u.pathname.replace(/^\/+/, "");
    return path.replace(/^@/, "").split("/")[0].split("?")[0];
  } catch {
    return url.replace(/.*[/@]/, "").split("?")[0];
  }
}
