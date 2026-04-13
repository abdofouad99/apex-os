import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini-rotator";
import { scrapeSocialProfile, SocialProfileData } from "@/services/lens/social-scraper";

export async function POST(req: NextRequest) {
  try {
    const { type, platformUrl, goals, contactInfo } = await req.json();

    // Validate required fields
    if (!type || !platformUrl || !goals?.length) {
      return NextResponse.json(
        { success: false, error: "بيانات غير مكتملة: يرجى ملء جميع الحقول المطلوبة." },
        { status: 400 }
      );
    }

    // 1. Real Social Media Scraping
    console.log(`🔍 LENS: Scraping ${platformUrl}...`);
    const scrapedData = await scrapeSocialProfile(platformUrl);
    console.log(`✅ LENS: Scraped ${scrapedData.username} (${scrapedData.followers} followers)`);

    // 2. Intelligent post quality analysis
    const postsAnalysis = analyzePostsFromData(scrapedData);

    // 3. Build smart prompt with REAL data
    const contactStr = contactInfo ? (`الاسم: ${contactInfo.name}، الإيميل: ${contactInfo.email}، الواتساب: ${contactInfo.phone}`) : "غير متوفر";

    const platformLabel = scrapedData.platform === "facebook" ? "فيسبوك"
      : scrapedData.platform === "instagram" ? "إنستجرام"
      : scrapedData.platform === "tiktok" ? "تيك توك"
      : "إكس (تويتر)";

    const systemPrompt = `أنت خبير عالمي في استراتيجيات نمو منصات التواصل الاجتماعي وفحص الحسابات (Social Media Audit Expert).
مهمتك هي تحليل الحساب وإعطاء تقرير دقيق وموجز وعالي القيمة للعميل ليقتنع بطلب استشارتك.

# بيانات العميل المدخلة:
- نوع الحساب: ${type === "company" ? "شركة / علامة تجارية" : "علامة شخصية / صانع محتوى"}
- المنصة: ${platformLabel}
- رابط الحساب: ${platformUrl}
- الأهداف الرئيسية: ${goals.join('، ')}
- بيانات المتصل: ${contactStr}

# البيانات الحقيقية المستخرجة من الحساب (Real-time Scraped):
- اسم المستخدم: ${scrapedData.username}
${scrapedData.displayName ? `- الاسم الظاهر: ${scrapedData.displayName}` : ""}
${scrapedData.followers && scrapedData.followers > 0 ? `- عدد المتابعين/اللايكات: ${scrapedData.followers.toLocaleString()}` : "- ⚠️ عدد المتابعين: غير متاح"}
${scrapedData.postsCount !== undefined && scrapedData.postsCount > 0 ? `- عدد الإعلانات النشطة: ${scrapedData.postsCount.toLocaleString()}` : ""}
${scrapedData.engagementRate ? `- معدل التفاعل: ${scrapedData.engagementRate}` : ""}
${scrapedData.isVerified ? `- ✅ حساب موثّق` : "- ❌ حساب غير موثّق"}
${scrapedData.bio ? `- البايو: "${scrapedData.bio}"` : ""}
- تقييم البايو: ${scrapedData.bioQuality}
- جودة المحتوى: ${scrapedData.contentQuality}
${scrapedData.externalUrl ? `- رابط خارجي: ${scrapedData.externalUrl}` : ""}
- تحليل المنشورات: ${postsAnalysis}

${scrapedData.recentPosts.length > 0 ? `
# آخر ${scrapedData.recentPosts.length} منشورات/إعلانات (للإشارة):
${scrapedData.recentPosts.slice(0, 8).map((p: any, i: number) => `${i + 1}. "${(p.caption || "بدون نص").substring(0, 120)}" — 📅 ${p.timestamp || "غير معروف"}`).join("\n")}
` : ""}

# المخرجات المطلوبة:
قوم بكتابة تقرير تحليلي من 4 أقسام رئيسية باللغة العربية:
1. **تشخيص الوضع الحالي (Current State):** فقرة قصيرة تلخص أداء الحساب بناءً على البيانات الحقيقية أعلاه. اذكر المنصة والاسم وأي أرقام متوفرة.
2. **نقاط القوة (Strengths):** نقطتين أو ثلاث (استخدم البيانات الفعلية).
3. **أخطاء قاتلة (Critical Mistakes):** أين يخسرون المال أو المتابعين (استند إلى البايو، التفاعل، عدد المنشورات).
4. **خطة عمل 30 يوم (Action Plan):** 3 خطوات عملية وقابلة للتنفيذ.

الأسلوب: احترافي، مباشر، ومقنع (كأنك استشاري تسويق تقدم هذا الفحص لعميل محتمل لتشجيعه على العمل معك).`;

    // 4. Call AI with real data
    const result = await callGeminiWithFallback({
      model: "gemini-2.0-flash",
      systemPrompt,
      userPrompt: "ابدأ الفحص الآن واكتب التقرير بناءً على البيانات الحقيقية المعروضة أعلاه.",
      temperature: 0.7,
      maxOutputTokens: 2048
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      scrapedData: formatForFrontend(scrapedData),
      report: result.text
    });

  } catch (error: any) {
    console.error("Lens Analyze Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── Helpers ──

function analyzePostsFromData(data: SocialProfileData): string {
  if (data.recentPosts.length === 0) {
    return "لا تتوفر بيانات منشورات كافية — يحتاج مراجعة يدوية";
  }

  const avgLikes = data.recentPosts.reduce((s, p) => s + (p.likes || 0), 0) / data.recentPosts.length;
  const avgComments = data.recentPosts.reduce((s, p) => s + (p.comments || 0), 0) / data.recentPosts.length;
  const hasCTA = data.recentPosts.some(p =>
    p.caption && /رابط|link|click|اضغط|اطلب|احجز|visit|subscribe|تسجيل|اشترك/i.test(p.caption)
  );

  const issues: string[] = [];
  if (avgComments < 5) issues.push("التعليقات منخفضة");
  if (!hasCTA) issues.push("ينقصه Call to Action");

  return issues.length > 0
    ? `متوسط: ${avgLikes.toFixed(0)} لايك، ${avgComments.toFixed(0)} تعليق — ${issues.join("، ")}`
    : `متوسط: ${avgLikes.toFixed(0)} لايك، ${avgComments.toFixed(0)} تعليق — المحتوى متنوع ويحتوي CTA`;
}

function formatForFrontend(data: SocialProfileData): Record<string, any> {
  const platformLabel = data.platform === "facebook" ? "فيسبوك"
    : data.platform === "instagram" ? "إنستجرام"
    : data.platform === "tiktok" ? "تيك توك"
    : "إكس";

  return {
    followers: data.followers || 0,
    engagementRate: data.engagementRate || "غير متوفر",
    bioQuality: data.bioQuality,
    contentQuality: data.contentQuality,
    platform: platformLabel,
    username: data.username,
    displayName: data.displayName,
    isVerified: data.isVerified,
    postsCount: data.postsCount || 0,
    following: data.following,
    recentPostsCount: data.recentPosts.length
  };
}
