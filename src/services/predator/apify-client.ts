/**
 * PREDATOR ENGINE - Apify Integration for Lead Scraping with Google Maps
 */
import { APIFY_TOKENS } from "@/lib/apify-rotator";
const GOOGLE_MAPS_ACTOR_ID = "compass~crawler-google-places";

export interface ApifyMapLead {
  title: string;
  website?: string;
  phone?: string;
  categoryName?: string;
  url?: string;
  rating?: number;
  reviewsCount?: number;
  city?: string;
}

export async function startGoogleMapsSearch(keywords: string, city: string, maxLeads: number = 20) {
  const searchQuery = `${keywords} في ${city}`;
  const payload = {
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: maxLeads,
    language: "ar", // Arabic focus
  };

  const tokens = APIFY_TOKENS || [];
  if (tokens.length === 0) throw new Error("Missing APIFY_API_TOKEN in environment.");

  for (let t = 0; t < tokens.length; t++) {
    const token = tokens[t];
    try {
      const response = await fetch(`https://api.apify.com/v2/acts/${GOOGLE_MAPS_ACTOR_ID}/runs?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const txt = await response.text();
        if (response.status === 403 && txt.includes("hard limit")) {
          console.warn(`⚠️ [Apify Predator] Token #${t + 1} quota exceeded → rotating...`);
          continue;
        }
        throw new Error(`Apify failed to start run: ${txt}`);
      }

      const { data } = await response.json();
      // append the token index so we know which token to poll with
      return `${data.id}::${t}`;
    } catch (error: any) {
      if (error.message?.includes("hard limit")) continue;
      throw error;
    }
  }

  throw new Error("APIFY_QUOTA_EXCEEDED");
}

export async function checkRunStatus(runIdWithToken: string) {
  if (runIdWithToken.startsWith("mock-")) {
    return { status: "SUCCEEDED", defaultDatasetId: "mock-dataset" };
  }

  const [runId, tokenIndexStr] = runIdWithToken.split("::");
  const tokens = APIFY_TOKENS || [];
  const token = tokens[parseInt(tokenIndexStr || "0")] || tokens[0];

  const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
  if (!response.ok) throw new Error("Failed to check run status");
  const { data } = await response.json();
  return { status: data.status, defaultDatasetId: `${data.defaultDatasetId}::${tokenIndexStr || "0"}` };
}

export async function getRunResults(datasetIdWithToken: string): Promise<ApifyMapLead[]> {
  const [datasetId, tokenIndexStr] = datasetIdWithToken.split("::");
  const tokens = APIFY_TOKENS || [];
  const token = tokens[parseInt(tokenIndexStr || "0")] || tokens[0];

  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
  
  if (!response.ok) {
    throw new Error(`Apify failed to fetch dataset: ${await response.text()}`);
  }

  return await response.json();
}
