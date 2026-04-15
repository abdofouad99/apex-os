export const maxDuration = 60;
import { NextResponse } from "next/server";
import { generateMarketingContent } from "@/services/forge/ai-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, platform, tone, audience, useMock } = body;

    if (!topic || !platform || !tone) {
      return NextResponse.json({ success: false, error: "الموضوع والمنصة والأسلوب مطلوبون" }, { status: 400 });
    }

    const ideas = await generateMarketingContent(topic, platform, tone, audience, useMock);

    return NextResponse.json({ success: true, ideas });
  } catch (error: any) {
    console.error("FORGE Generation Error:", error);
    return NextResponse.json({ success: false, error: error.message || "حدث خطأ أثناء الاتصال بمولد الذكاء الاصطناعي." }, { status: 500 });
  }
}
