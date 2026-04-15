/**
 * Apify Token Rotator
 * Tries tokens in order, automatically rotates on 403 quota exceeded
 */

const APIFY_TOKENS = [
  process.env.APIFY_API_TOKEN,
  process.env.APIFY_API_TOKEN_2,
  process.env.APIFY_API_TOKEN_3,
  process.env.APIFY_API_TOKEN_4,
  process.env.APIFY_API_TOKEN_5,
  process.env.APIFY_API_TOKEN_BACKUP, // Old token as last resort
].filter(Boolean) as string[];

export async function runApifyWithRotation(
  actorId: string,
  input: object,
  timeoutSecs = 150
): Promise<any[]> {
  const encodedId = actorId.replace("/", "~");
  const APIFY_BASE = "https://api.apify.com/v2";

  for (let t = 0; t < APIFY_TOKENS.length; t++) {
    const token = APIFY_TOKENS[t];
    console.log(`🔑 [Apify] Trying token #${t + 1}...`);

    try {
      const startRes = await fetch(`${APIFY_BASE}/acts/${encodedId}/runs?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!startRes.ok) {
        const txt = await startRes.text();
        if (startRes.status === 403 && txt.includes("hard limit")) {
          console.warn(`⚠️ [Apify] Token #${t + 1} quota exceeded → rotating...`);
          continue; // Try next token
        }
        throw new Error(`Apify start failed (${startRes.status}): ${txt.substring(0, 300)}`);
      }

      const { data: runData } = await startRes.json();
      const runId = runData.id;
      const datasetId = runData.defaultDatasetId;
      console.log(`🚀 [Apify] Token #${t + 1} — runId=${runId}`);

      // Poll for completion
      const maxAttempts = Math.ceil(timeoutSecs / 5);
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
        const { data } = await statusRes.json();
        console.log(`📊 [Apify] ${data.status} (${i + 1}/${maxAttempts})`);

        if (data.status === "SUCCEEDED") break;
        if (["FAILED", "ABORTED", "TIMED-OUT"].includes(data.status)) {
          throw new Error(`Apify run ${data.status}`);
        }
      }

      const resultsRes = await fetch(`${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&limit=100`);
      const items = await resultsRes.json();
      console.log(`📦 [Apify] Got ${items.length} items`);
      return Array.isArray(items) ? items : [];

    } catch (err: any) {
      if (err.message === "APIFY_QUOTA_EXCEEDED" || err.message?.includes("hard limit")) {
        console.warn(`⚠️ [Apify] Token #${t + 1} failed → rotating...`);
        continue;
      }
      throw err; // Real error — don't retry
    }
  }

  // All tokens exhausted
  throw new Error("APIFY_QUOTA_EXCEEDED");
}

export function getApifyTokensStatus(): { index: number; exists: boolean }[] {
  return APIFY_TOKENS.map((t, i) => ({ index: i + 1, exists: !!t }));
}
