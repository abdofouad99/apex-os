/**
 * PREDATOR ENGINE - Apify Integration for Lead Scraping with Google Maps
 */
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
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
  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");

  // For compass~crawler-google-places
  const searchQuery = `${keywords} في ${city}`;

  const payload = {
    searchStringsArray: [searchQuery],
    maxCrawledPlacesPerSearch: maxLeads,
    language: "ar", // Arabic focus
  };

  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${GOOGLE_MAPS_ACTOR_ID}/runs?token=${APIFY_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Apify failed to start run: ${await response.text()}`);
    }

    const { data } = await response.json();
    return data.id; // Returns the Run ID to poll for results
  } catch (error) {
    console.error("PREDATOR (Apify) Run Error:", error);
    throw error;
  }
}

export async function checkRunStatus(runId: string) {
  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");
  
  if (runId.startsWith("mock-")) {
    return { status: "SUCCEEDED", defaultDatasetId: "mock-dataset" };
  }

  const response = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
  if (!response.ok) throw new Error("Failed to check run status");
  const { data } = await response.json();
  return { status: data.status, defaultDatasetId: data.defaultDatasetId };
}

export async function getRunResults(datasetId: string): Promise<ApifyMapLead[]> {
  if (!APIFY_TOKEN) throw new Error("Missing APIFY_API_TOKEN in environment.");

  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
  
  if (!response.ok) {
    throw new Error(`Apify failed to fetch dataset: ${await response.text()}`);
  }

  return await response.json();
}
