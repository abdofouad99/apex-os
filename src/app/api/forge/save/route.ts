import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { title, content, platform, agencyId } = body;

    if (!title || !content || !platform) {
      return NextResponse.json({ success: false, error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // Safety fallback: Give it a blank UUID agency if it's running detached from Auth initially
    // For Production: agencyId should come from the verified user session
    if (!agencyId) {
      // Find the first available Agency to attach it to, or create a mock one.
      const firstAgency = await prisma.agency.findFirst();
      if (firstAgency) {
        agencyId = firstAgency.id;
      } else {
        const fallbackAgency = await prisma.agency.create({ data: { name: "Default Agency" } });
        agencyId = fallbackAgency.id;
      }
    }

    const newIdea = await prisma.contentIdea.create({
      data: {
        title,
        body: content,
        platform,
        agencyId,
        status: "DRAFT"
      }
    });

    return NextResponse.json({ success: true, idea: newIdea });
  } catch (error: any) {
    console.error("FORGE Save Error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حفظ الفكرة في قاعدة البيانات." }, { status: 500 });
  }
}
