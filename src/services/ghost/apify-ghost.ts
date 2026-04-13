export function extractPageName(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    return pathParts[0] || "Unknown Page";
  } catch {
    return "Unknown Page";
  }
}

export function detectPlatform(url: string): string {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('instagram.com')) return 'instagram';
  if (lowercaseUrl.includes('facebook.com')) return 'facebook';
  if (lowercaseUrl.includes('tiktok.com')) return 'tiktok';
  return 'facebook'; // fallback
}

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const META_ADS_ACTOR_ID = process.env.APIFY_GHOST_ACTOR_ID || "curious_coder~facebook-ads-library-scraper";

export interface ApifyAdResult {
  adId?: string;
  pageName?: string;
  adText?: string;
  imageUrl?: string;
  videoUrl?: string;
  startDate?: string;
  status?: string;
  isActive?: boolean;
}

export async function startAdsScraping(pageUrl: string) {
  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");

  const pageName = extractPageName(pageUrl);
  
  // Facebook Ad Library Scraper standard payload structure
  const payload = {
    urls: [{ url: pageUrl }],
    activeStatus: "active",
    useApifyProxy: true,
    maxAds: 50 // Provide a safe max to avoid token drain
  };

  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${META_ADS_ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Apify Ghost failed to start run: ${await response.text()}`);

    const { data } = await response.json();
    return data.id; // Returns Job/Run ID
  } catch (error) {
    console.error("GHOST (Apify) Run Error:", error);
    throw error;
  }
}

export async function checkGhostRunStatus(runId: string) {
  if (runId.startsWith("mock-")) {
    return { status: "SUCCEEDED", defaultDatasetId: "mock-ads-dataset" };
  }

  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");
  
  const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  if (!response.ok) throw new Error("Failed to check run status");
  const { data } = await response.json();
  return { status: data.status, defaultDatasetId: data.defaultDatasetId };
}

export async function getAdsResults(datasetId: string): Promise<ApifyAdResult[]> {
  if (datasetId === "mock-ads-dataset") {
    // Will be handled in route by calling mock directly, but fallback just in case
    return [];
  }

  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");

  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
  if (!response.ok) throw new Error(`Apify Ghost failed to fetch dataset: ${await response.text()}`);

  const items = await response.json();
  return items.map((item: any) => {
    const s = item.snapshot || item;

    // Extract body text - can be string, object with text property, or null
    let adText = '';
    if (typeof s.body === 'string') adText = s.body;
    else if (s.body && typeof s.body === 'object') adText = s.body.text || '';
    else adText = item.primaryText || item.adText || item.text || '';

    // Extract image URL
    let imageUrl = '';
    if (s.images && s.images.length > 0) {
      const img = s.images[0];
      imageUrl = img.original_image_url || img.url || img.image_url || '';
    }
    if (!imageUrl && s.videos && s.videos.length > 0) {
      imageUrl = s.videos[0].video_preview_image_url || '';
    }
    if (!imageUrl) {
      imageUrl = item.images?.[0] || item.thumbnailUrl || item.image?.[0] || item.creative?.[0]?.imageUrl || '';
    }

    // Extract video URL
    let videoUrl = '';
    if (s.videos && s.videos.length > 0) {
      videoUrl = s.videos[0].video_sd_url || s.videos[0].video_hd_url || '';
    }
    if (!videoUrl) {
      videoUrl = item.videos?.[0] || item.video?.[0] || item.creative?.[0]?.videoUrl || '';
    }

    return {
      error: item.error,
      errorDescription: item.errorDescription,
      adId: item.id || item.adArchiveID || item.archive_id || item.ad_archive_id,
      pageName: s.page_name || item.pageName || item.page_name || '',
      adText,
      imageUrl,
      videoUrl,
      startDate: item.startDate || item.start_date || item.start_date_formatted,
      status: (item.isActive || item.active || item.is_active) ? "ACTIVE" : "INACTIVE",
      isActive: !!item.isActive || !!item.active || !!item.is_active
    };
  });
}
