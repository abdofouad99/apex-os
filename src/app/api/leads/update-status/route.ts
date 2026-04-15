export const maxDuration = 60;
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, newStatus } = body;

    if (!leadId || !newStatus) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const validStatuses = Object.values(LeadStatus);
    if (!validStatuses.includes(newStatus as LeadStatus)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: newStatus as LeadStatus },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error("Lead Status Update Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update lead status" }, { status: 500 });
  }
}
