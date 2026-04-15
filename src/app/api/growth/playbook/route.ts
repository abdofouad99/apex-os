export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Return growth playbook rules
export async function GET() {
  try {
    const agency = await prisma.agency.findFirst();
    if (!agency) return NextResponse.json({ success: true, rules: [] });

    const rules = await prisma.growthPlaybook.findMany({
      where: { agencyId: agency.id },
      orderBy: { lift: "desc" },
    });

    return NextResponse.json({ success: true, rules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
