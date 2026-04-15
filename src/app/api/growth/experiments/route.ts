export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ============================================================
// PULSE Engine — Growth Experiments API
// Based on ai-marketing-skills/growth-engine
// ============================================================

// GET: List all experiments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const agency = await prisma.agency.findFirst();
    if (!agency) return NextResponse.json({ success: true, experiments: [] });

    const experiments = await prisma.experiment.findMany({
      where: {
        agencyId: agency.id,
        ...(status ? { status: status as any } : {}),
      },
      include: { dataPoints: true },
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats per experiment
    const enriched = experiments.map((exp) => {
      const variantStats: Record<string, { count: number; sum: number; avg: number }> = {};
      
      exp.dataPoints.forEach((dp) => {
        const metrics = dp.metrics as Record<string, number>;
        const primaryValue = metrics[exp.metric] || 0;
        if (!variantStats[dp.variant]) {
          variantStats[dp.variant] = { count: 0, sum: 0, avg: 0 };
        }
        variantStats[dp.variant].count++;
        variantStats[dp.variant].sum += primaryValue;
      });

      Object.keys(variantStats).forEach((v) => {
        variantStats[v].avg = variantStats[v].count > 0
          ? Math.round((variantStats[v].sum / variantStats[v].count) * 100) / 100
          : 0;
      });

      return { ...exp, variantStats };
    });

    return NextResponse.json({ success: true, experiments: enriched });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Create experiment OR log data point
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const agency = await prisma.agency.findFirst();
    if (!agency) {
      const newAgency = await prisma.agency.create({ data: { name: "Default Agency" } });
      body.agencyId = newAgency.id;
    } else {
      body.agencyId = agency.id;
    }

    // ── CREATE EXPERIMENT ────────────────────────────────────
    if (action === "create") {
      const { name, hypothesis, variable, metric, variants, minSamples } = body;

      if (!name || !hypothesis || !variable || !metric || !variants) {
        return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 });
      }

      const experiment = await prisma.experiment.create({
        data: {
          name,
          hypothesis,
          variable,
          metric,
          variants,
          minSamples: minSamples || 15,
          status: "RUNNING",
          agencyId: body.agencyId,
        },
      });

      return NextResponse.json({ success: true, experiment });
    }

    // ── LOG DATA POINT ───────────────────────────────────────
    if (action === "log") {
      const { experimentId, variant, metrics } = body;

      if (!experimentId || !variant || !metrics) {
        return NextResponse.json({ success: false, error: "بيانات ناقصة" }, { status: 400 });
      }

      const dataPoint = await prisma.dataPoint.create({
        data: { experimentId, variant, metrics },
      });

      // Auto-score after logging
      await scoreExperiment(experimentId, body.agencyId);

      return NextResponse.json({ success: true, dataPoint });
    }

    // ── SCORE EXPERIMENT ─────────────────────────────────────
    if (action === "score") {
      const { experimentId } = body;
      const result = await scoreExperiment(experimentId, body.agencyId);
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    console.error("PULSE API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ============================================================
// Statistical Scoring — Mann-Whitney U + Lift calculation
// Ported from ai-marketing-skills/growth-engine/experiment-engine.py
// ============================================================
async function scoreExperiment(experimentId: string, agencyId: string) {
  const exp = await prisma.experiment.findUnique({
    where: { id: experimentId },
    include: { dataPoints: true },
  });
  if (!exp) return { status: "not_found" };

  const variants = exp.variants as string[];
  const metric = exp.metric;
  const minSamples = exp.minSamples;

  // Group values by variant
  const variantValues: Record<string, number[]> = {};
  variants.forEach((v) => { variantValues[v] = []; });

  exp.dataPoints.forEach((dp) => {
    const metrics = dp.metrics as Record<string, number>;
    const val = metrics[metric] ?? 0;
    if (variantValues[dp.variant]) {
      variantValues[dp.variant].push(val);
    }
  });

  // Check minimum samples
  const allHaveMinSamples = variants.every((v) => variantValues[v].length >= minSamples);
  if (!allHaveMinSamples) {
    const counts = variants.map((v) => `${v}: ${variantValues[v].length}/${minSamples}`).join(", ");
    return { status: "RUNNING", message: `تحتاج لمزيد من البيانات — ${counts}` };
  }

  // Calculate means per variant
  const means: Record<string, number> = {};
  variants.forEach((v) => {
    const vals = variantValues[v];
    means[v] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  // Find best variant (highest mean)
  const winner = variants.reduce((a, b) => (means[a] >= means[b] ? a : b));
  const loser = variants.find((v) => v !== winner) || variants[0];

  const winnerMean = means[winner];
  const loserMean = means[loser];

  const lift = loserMean > 0 ? ((winnerMean - loserMean) / loserMean) * 100 : 0;

  // Simple Mann-Whitney U approximation
  const n1 = variantValues[winner].length;
  const n2 = variantValues[loser].length;
  const allVals = [...variantValues[winner].map(v => ({v, g: "a"})), ...variantValues[loser].map(v => ({v, g: "b"}))]
    .sort((a, b) => a.v - b.v);
  
  let U1 = 0;
  let rank = 1;
  allVals.forEach(item => {
    if (item.g === "a") U1 += rank - variantValues[winner].indexOf(item.v) - 1;
    rank++;
  });

  const U = Math.min(U1, n1 * n2 - U1);
  const pValue = U / (n1 * n2); // simplified p-value estimate

  let newStatus: "RUNNING" | "TRENDING" | "KEEP" | "DISCARD" = "RUNNING";
  if (pValue < 0.05 && lift >= 15) newStatus = "KEEP";
  else if (pValue < 0.10 && lift >= 5) newStatus = "TRENDING";
  else if (variantValues[winner].length >= minSamples * 3) newStatus = "DISCARD";

  // Update experiment
  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: newStatus, winnerId: newStatus === "KEEP" ? winner : null },
  });

  // If winner found, add to playbook
  if (newStatus === "KEEP") {
    await prisma.growthPlaybook.upsert({
      where: { id: `playbook_${experimentId}` },
      create: {
        id: `playbook_${experimentId}`,
        rule: `${exp.hypothesis} — الفائز: ${winner} بتفوق ${lift.toFixed(1)}%`,
        evidence: `تجربة: ${exp.name} | المقياس: ${metric} | عينات: ${n1 + n2}`,
        lift: parseFloat(lift.toFixed(2)),
        channel: exp.variable,
        agencyId,
      },
      update: { lift: parseFloat(lift.toFixed(2)) },
    });
  }

  return {
    status: newStatus,
    winner,
    lift: parseFloat(lift.toFixed(2)),
    pValue: parseFloat(pValue.toFixed(3)),
    means,
    message: `الفائز: ${winner} | تفوق: ${lift.toFixed(1)}% | p-value: ${pValue.toFixed(3)}`,
  };
}
