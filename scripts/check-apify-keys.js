require('dotenv').config();

async function checkApify() {
  const token = process.env.APIFY_API_TOKEN;
  // Fetch latest runs for the actor
  const actorId = process.env.APIFY_GHOST_ACTOR_ID || "apify~facebook-ads-scraper";
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs?token=${token}&desc=true&limit=1`);
  const data = await res.json();
  
  if (data.data && data.data.items && data.data.items.length > 0) {
    const defaultDatasetId = data.data.items[0].defaultDatasetId;
    console.log("Found dataset:", defaultDatasetId);
    
    const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${token}&limit=2`);
    const items = await datasetRes.json();
    console.log(JSON.stringify(items, null, 2));
  } else {
    console.log("No runs found");
  }
}

checkApify();
