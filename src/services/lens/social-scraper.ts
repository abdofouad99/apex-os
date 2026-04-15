/**
 * LENS ENGINE - Real Social Media Scraping v2.0
 * Uses Apify actors for REAL data:
 * - Instagram: apify/instagram-profile-scraper + apify/instagram-post-scraper
 * - Facebook: apify/facebook-pages-scraper + Ads Library
 * - TikTok: apify/tiktok-profile-scraper
 * - X/Twitter: FxTwitter API (free)
 */

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE = "https://api.apify.com/v2";

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
  avgViews?: number;
  profilePicUrl?: string;
  isVerified?: boolean;
  externalUrl?: string;
  category?: string;
  recentPosts: Array<{
    caption?: string;
    likes?: number;
    comments?: number;
    views?: number;
    timestamp?: string;
    mediaType?: "image" | "video" | "carousel";
    url?: string;
  }>;
  bioQuality: string;
  contentQuality: string;
  dataSource: "apify" | "api" | "limited";
}

// ── Apify Runner ──
async function runApifyActor(actorId: string, input: object, timeoutSecs = 120): Promise<any[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_API_TOKEN not configured");

  // Apify uses ~ instead of / in actor IDs in URLs
  const encodedActorId = actorId.replace("/", "~");

  // Start run
  const startRes = await fetch(`${APIFY_BASE}/acts/${encodedActorId}/runs?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!startRes.ok) {
    const txt = await startRes.text();
    throw new Error(`Apify start failed (${startRes.status}): ${txt.substring(0, 200)}`);
  }

  const { data: runData } = await startRes.json();
  const runId = runData.id;
  const datasetId = runData.defaultDatasetId;
  console.log(`🚀 Apify [${actorId}] started: runId=${runId}`);

  // Poll for completion
  const maxAttempts = Math.ceil(timeoutSecs / 5);
  let attempts = 0;
  let status = "RUNNING";

  while ((status === "RUNNING" || status === "READY") && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 5000));
    attempts++;

    try {
      const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      const { data } = await statusRes.json();
      status = data.status;
      console.log(`📊 Apify [${actorId}] status: ${status} (${attempts}/${maxAttempts})`);
      if (status === "SUCCEEDED") break;
      if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
        throw new Error(`Apify run ${status}`);
      }
    } catch (e: any) {
      if (e.message.includes("Apify run")) throw e;
    }
  }

  // Fetch results
  const resultsRes = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&limit=20`
  );
  if (!resultsRes.ok) throw new Error(`Failed to fetch dataset: ${resultsRes.status}`);

  const items = await resultsRes.json();
  console.log(`📦 Apify [${actorId}] got ${items.length} items`);
  return items;
}

// ── Main Entry ──
export async function scrapeSocialProfile(platformUrl: string): Promise<SocialProfileData> {
  const platform = detectPlatform(platformUrl);
  const username = extractUsername(platformUrl);
  console.log(`🔍 LENS v2: platform=${platform}, username=${username}`);

  let data: Partial<SocialProfileData> = { platform: platform as any, username };

  try {
    switch (platform) {
      case "instagram":
        data = await scrapeInstagram(platformUrl, username);
        break;
      case "facebook":
        data = await scrapeFacebook(platformUrl, username);
        break;
      case "tiktok":
        data = await scrapeTikTok(platformUrl, username);
        break;
      case "x":
        data = await scrapeX(platformUrl, username);
        break;
    }
  } catch (e: any) {
    console.warn(`⚠️ Scraping failed for ${platform}:`, e.message);
    data.dataSource = "limited";
  }

  // Calculate engagement rate if we have real data
  if (data.followers && data.followers > 0 && (data.avgLikes !== undefined || data.avgComments !== undefined)) {
    const avgLikes = data.avgLikes || 0;
    const avgComments = data.avgComments || 0;
    const engRate = ((avgLikes + avgComments) / data.followers) * 100;
    data.engagementRate = `${engRate.toFixed(2)}%`;
  }

  const bio = data.bio || "";
  return {
    platform: platform as SocialProfileData["platform"],
    username: data.username || username,
    displayName: data.displayName,
    bio,
    followers: data.followers || 0,
    following: data.following,
    postsCount: data.postsCount,
    engagementRate: data.engagementRate,
    avgLikes: data.avgLikes,
    avgComments: data.avgComments,
    avgViews: data.avgViews,
    profilePicUrl: data.profilePicUrl,
    isVerified: data.isVerified,
    externalUrl: data.externalUrl,
    category: data.category,
    recentPosts: data.recentPosts || [],
    bioQuality: data.bioQuality || analyzeBioQuality(bio, platform),
    contentQuality: data.contentQuality || "لم يتم تحليل المحتوى",
    dataSource: data.dataSource || "apify"
  };
}

// ── Instagram (Real Apify Scraper) ──
async function scrapeInstagram(url: string, username: string): Promise<Partial<SocialProfileData>> {
  console.log(`📸 Instagram: Scraping @${username} via Apify...`);

  // apify~instagram-profile-scraper: Official Apify Instagram actor
  const items = await runApifyActor("apify/instagram-profile-scraper", {
    usernames: [username],
    resultsLimit: 12
  }, 120);

  if (!items || items.length === 0) {
    throw new Error("No Instagram data returned from Apify");
  }

  const profile = items[0];
  console.log(`✅ Instagram: Got data for @${username}, followers=${profile.followersCount}`);

  // Process recent posts - handle multiple response schemas
  const rawPosts = profile.latestPosts || profile.posts || profile.media || [];
  const posts = rawPosts.slice(0, 12).map((p: any) => ({
    caption: (p.caption || p.text || "").substring(0, 300),
    likes: p.likesCount || p.likes || p.diggCount || 0,
    comments: p.commentsCount || p.comments || p.commentCount || 0,
    views: p.videoViewCount || p.videoPlayCount || p.viewCount || 0,
    timestamp: p.timestamp || p.takenAt || p.time || "",
    mediaType: (p.type === "Video" || p.isVideo) ? "video" as const : (p.type === "Sidecar" ? "carousel" as const : "image" as const),
    url: p.url || (p.shortCode ? `https://www.instagram.com/p/${p.shortCode}/` : "")
  }));

  const avgLikes = posts.length > 0 ? posts.reduce((s: number, p: any) => s + (p.likes || 0), 0) / posts.length : 0;
  const avgComments = posts.length > 0 ? posts.reduce((s: number, p: any) => s + (p.comments || 0), 0) / posts.length : 0;

  const followers = profile.followersCount || profile.followers || profile.followerCount || 0;
  const bio = profile.biography || profile.bio || profile.description || "";
  return {
    platform: "instagram",
    username: profile.username || username,
    displayName: profile.fullName || profile.name || profile.displayName,
    bio,
    followers,
    following: profile.followsCount || profile.following || profile.followingCount || 0,
    postsCount: profile.postsCount || profile.mediaCount || 0,
    isVerified: profile.verified || profile.isVerified || false,
    profilePicUrl: profile.profilePicUrlHD || profile.profilePicUrl || "",
    externalUrl: profile.externalUrl || profile.website || profile.url || "",
    category: profile.businessCategoryName || profile.category || "",
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    recentPosts: posts,
    bioQuality: analyzeBioQuality(bio, "instagram"),
    contentQuality: analyzeContentQuality({ recentPosts: posts, followers }, "instagram"),
    dataSource: "apify"
  };
}

// ── Facebook (Real Apify Scraper) ──
async function scrapeFacebook(url: string, username: string): Promise<Partial<SocialProfileData>> {
  console.log(`📘 Facebook: Scraping ${username} via Apify (parallel: page + posts)...`);

  const normalizedUrl = url.startsWith("http") ? url : `https://www.facebook.com/${username}`;

  // Run both actors in parallel: page metadata + posts
  const [pageItems, postItems] = await Promise.allSettled([
    // Actor 1: Page metadata (followers, bio, category)
    runApifyActor("apify/facebook-pages-scraper", {
      startUrls: [{ url: normalizedUrl }],
      maxPosts: 0,
      maxPostComments: 0,
      maxReviews: 0,
      proxyConfiguration: { useApifyProxy: true }
    }, 120),
    // Actor 2: Actual page posts
    runApifyActor("apify/facebook-posts-scraper", {
      startUrls: [{ url: normalizedUrl }],
      resultsLimit: 12,
      proxyConfiguration: { useApifyProxy: true }
    }, 120)
  ]);

  const pageData = pageItems.status === "fulfilled" ? pageItems.value : [];
  const postsData = postItems.status === "fulfilled" ? postItems.value : [];

  console.log(`📊 Facebook: page items=${pageData.length}, post items=${postsData.length}`);

  if (pageData.length === 0 && postsData.length === 0) {
    throw new Error("No Facebook data returned from Apify");
  }

  const page = pageData[0] || {};
  console.log(`✅ Facebook page: ${page.title || page.name || username}, followers=${page.likes}, keys=${Object.keys(page).slice(0,10).join(",")}`);

  // Extract bio from 'info' array (facebook-pages-scraper format)
  let bio = page.about || page.description || page.intro || page.biography || "";
  if (!bio && page.info) {
    if (Array.isArray(page.info)) {
      bio = (page.info as any[]).map((i: any) => i.text || i.content || i.value || (typeof i === "string" ? i : "")).filter(Boolean).join(" | ");
    } else if (typeof page.info === "string") {
      bio = page.info;
    } else if (typeof page.info === "object") {
      bio = Object.values(page.info as object).filter(v => typeof v === "string").join(" | ");
    }
  }
  console.log(`📋 Facebook bio: "${bio.substring(0, 100)}"`);



  const posts = postsData.slice(0, 12).map((p: any) => ({
    caption: (p.text || p.message || p.story || p.postText || p.body || "").substring(0, 300),
    likes: p.likes || p.likesCount || p.reactionsCount || p.reactions || 0,
    comments: p.comments || p.commentsCount || p.commentCount || 0,
    timestamp: p.time || p.date || p.createdTime || p.publishedAt || "",
    mediaType: (p.video || p.type === "video" || p.hasVideo) ? "video" as const : "image" as const,
    url: p.postUrl || p.url || p.link || ""
  }));

  console.log(`📝 Facebook extracted posts: ${posts.length}, bio: "${bio.substring(0,80)}"`);

  const followers = page.followers || page.fans || page.likes || 0;
  const avgLikes = posts.length > 0 ? posts.reduce((s: number, p: any) => s + (p.likes || 0), 0) / posts.length : 0;
  const avgComments = posts.length > 0 ? posts.reduce((s: number, p: any) => s + (p.comments || 0), 0) / posts.length : 0;

  // Verified: check all possible fields + categories array for verification keywords
  const cats = Array.isArray(page.categories) ? (page.categories as string[]).join(" ").toLowerCase() : "";
  const isVerified = page.verified || page.isVerified || page.verifiedPage ||
    cats.includes("verified") || cats.includes("official") || false;

  return {
    platform: "facebook",
    username: page.username || page.pageName || username,
    displayName: page.title || page.name || username,
    bio,
    followers,
    postsCount: posts.length,
    isVerified,
    profilePicUrl: page.profileImage || page.logo || "",
    externalUrl: page.website || page.externalUrl || "",
    category: Array.isArray(page.categories) ? (page.categories as string[])[0] : (page.category || page.pageCategory || ""),
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    recentPosts: posts,
    bioQuality: analyzeBioQuality(bio, "facebook"),
    contentQuality: analyzeContentQuality({ recentPosts: posts, followers }, "facebook"),
    dataSource: "apify"
  };
}

// ── TikTok (Real Apify Scraper) ──
async function scrapeTikTok(url: string, username: string): Promise<Partial<SocialProfileData>> {
  console.log(`🎵 TikTok: Scraping @${username} via Apify...`);

  const cleanUsername = username.startsWith("@") ? username : `@${username}`;

  // clockworks~tiktok-profile-scraper: Reliable TikTok actor
  const items = await runApifyActor("clockworks/tiktok-profile-scraper", {
    profiles: [cleanUsername],
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
    maxProfilesPerQuery: 1
  }, 90);

  if (!items || items.length === 0) {
    throw new Error("No TikTok data from Apify");
  }

  const item = items[0];
  // clockworks/tiktok-profile-scraper returns data inside authorMeta
  const profile = item.authorMeta || item;
  console.log(`✅ TikTok: @${profile.name || profile.uniqueId || username}, followers=${profile.fans || profile.followerCount}`);
  console.log(`  🗝 Profile keys: ${Object.keys(profile).slice(0, 12).join(", ")}`);

  const rawVideos = item.videos || item.latestVideos || profile.videos || [];
  const videos = rawVideos.slice(0, 12).map((v: any) => ({
    caption: (v.text || v.description || v.title || "").substring(0, 300),
    likes: v.diggCount || v.likesCount || v.likes || 0,
    comments: v.commentCount || v.comments || 0,
    views: v.playCount || v.viewCount || v.views || 0,
    timestamp: v.createTime ? new Date(v.createTime * 1000).toISOString() : "",
    mediaType: "video" as const,
    url: v.webVideoUrl || v.url || ""
  }));

  const followers = profile.fans || profile.followerCount || profile.followersCount || 0;
  const bio = profile.signature || profile.bio || profile.description || "";

  const avgLikes = videos.length > 0 ? videos.reduce((s: number, v: any) => s + (v.likes || 0), 0) / videos.length : 0;
  const avgComments = videos.length > 0 ? videos.reduce((s: number, v: any) => s + (v.comments || 0), 0) / videos.length : 0;
  const avgViews = videos.length > 0 ? videos.reduce((s: number, v: any) => s + (v.views || 0), 0) / videos.length : 0;

  return {
    platform: "tiktok",
    username: profile.uniqueId || profile.name || username,
    displayName: profile.nickName || profile.nickname || profile.name || username,
    bio,
    followers,
    following: profile.following || profile.followingCount || 0,
    postsCount: profile.videoCount || profile.videosCount || rawVideos.length,
    isVerified: profile.verified || profile.isVerified || false,
    profilePicUrl: profile.avatarLarger || profile.avatar || profile.avatarMedium || "",
    avgLikes: Math.round(avgLikes),
    avgComments: Math.round(avgComments),
    avgViews: Math.round(avgViews),
    recentPosts: videos,
    bioQuality: analyzeBioQuality(bio, "tiktok"),
    contentQuality: analyzeContentQuality({ recentPosts: videos, followers }, "tiktok"),
    dataSource: "apify"
  };
}


// ── X/Twitter (FxTwitter - Free API) ──
async function scrapeX(url: string, username: string): Promise<Partial<SocialProfileData>> {
  console.log(`🐦 X/Twitter: Scraping @${username} via FxTwitter...`);

  const res = await fetch(`https://api.fxtwitter.com/${username}`, {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(15000)
  });

  if (!res.ok) throw new Error(`FxTwitter returned ${res.status}`);

  const data = await res.json();
  const u = data?.user;
  if (!u) throw new Error("No user data from FxTwitter");

  console.log(`✅ X: Got @${username}, followers=${u.followers_count}`);

  return {
    platform: "x",
    username: u.screen_name || username,
    displayName: u.name,
    bio: u.description,
    followers: u.followers_count,
    following: u.friends_count,
    postsCount: u.statuses_count,
    isVerified: u.verified || u.is_blue_verified || false,
    profilePicUrl: u.profile_image_url_https || u.profile_image_url,
    externalUrl: u.url || u.entities?.url?.urls?.[0]?.expanded_url,
    recentPosts: [],
    bioQuality: analyzeBioQuality(u.description || "", "x"),
    contentQuality: `${u.statuses_count?.toLocaleString()} تغريدة | ${u.followers_count?.toLocaleString()} متابع`,
    dataSource: "api"
  };
}

// ── Quality Analyzers ──
function analyzeBioQuality(bio: string, platform: string): string {
  if (!bio || bio.length < 10) {
    return "❌ البايو فارغ أو قصير جداً — أولوية قصوى لإضافة عرض القيمة";
  }

  let score = 0;
  if (/\d/.test(bio)) score++;
  if (/http|link|رابط|🔗|👇|⬇️/i.test(bio)) score++;
  if (bio.length > 50 && bio.length < 200) score++;
  if (/ساعد|نساعد|نبني|نقدم|help|build|create|grow/i.test(bio)) score++;
  if (/مؤسس|مدير|خبير|CEO|Founder|Owner|Director/i.test(bio)) score++;
  if (/📞|📧|واتساب|WhatsApp|تواصل|contact/i.test(bio)) score++;

  if (score >= 5) return "✅ ممتاز — البايو يعكس عرض القيمة بوضوح";
  if (score >= 3) return "🟡 جيد — البايو مقبول لكن ينقصه Call to Action";
  if (score >= 2) return "🟠 متوسط — البايو يحتاج تحسين واضح";
  return "🔴 ضعيف — لا يعكس عرض القيمة، تحتاج إعادة كتابة كاملة";
}

function analyzeContentQuality(data: { recentPosts: any[], followers?: number }, platform: string): string {
  const posts = data.recentPosts || [];
  if (posts.length === 0) return "لا تتوفر بيانات منشورات";

  const avgLikes = posts.reduce((s, p) => s + (p.likes || 0), 0) / posts.length;
  const avgComments = posts.reduce((s, p) => s + (p.comments || 0), 0) / posts.length;
  const avgViews = posts.reduce((s, p) => s + (p.views || 0), 0) / posts.length;

  const followers = data.followers || 0;
  let engagementNote = "";

  if (followers > 0) {
    const rate = ((avgLikes + avgComments) / followers) * 100;
    if (rate > 6) engagementNote = "🔥 تفاعل استثنائي";
    else if (rate > 3) engagementNote = "✅ تفاعل فوق المتوسط";
    else if (rate > 1) engagementNote = "🟡 تفاعل متوسط";
    else engagementNote = "🔴 تفاعل ضعيف يحتاج تحسين";
  }

  const hasCTA = posts.some(p =>
    p.caption && /رابط|link|click|اضغط|اطلب|احجز|visit|subscribe|تسجيل|اشترك|تواصل/i.test(p.caption)
  );

  const hasVideo = posts.some(p => p.mediaType === "video");

  let result = `متوسط ${Math.round(avgLikes).toLocaleString()} لايك | ${Math.round(avgComments).toLocaleString()} تعليق`;
  if (avgViews > 0) result += ` | ${Math.round(avgViews).toLocaleString()} مشاهدة`;
  if (engagementNote) result += ` — ${engagementNote}`;
  if (!hasCTA) result += " | ⚠️ غياب CTA";
  if (!hasVideo) result += " | ⚠️ لا يوجد فيديو";

  return result;
}

// ── Utilities ──
function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("facebook.com") || u.includes("fb.com")) return "facebook";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "x";
  return "instagram";
}

function extractUsername(url: string): string {
  try {
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const u = new URL(fullUrl);
    const path = u.pathname.replace(/^\/+/, "");
    return path.replace(/^@/, "").split("/")[0].split("?")[0] || url;
  } catch {
    return url.replace(/.*[/@]/, "").split("?")[0];
  }
}
