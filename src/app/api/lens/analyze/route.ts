import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini-rotator";
import { scrapeSocialProfile, SocialProfileData } from "@/services/lens/social-scraper";

export async function POST(req: NextRequest) {
  try {
    const { type, platformUrl, goals, contactInfo } = await req.json();

    if (!type || !platformUrl || !goals?.length) {
      return NextResponse.json(
        { success: false, error: "بيانات غير مكتملة: يرجى ملء جميع الحقول المطلوبة." },
        { status: 400 }
      );
    }

    // 1. Real Scraping
    console.log(`🔍 LENS: Starting real scrape for ${platformUrl}`);
    const scrapedData = await scrapeSocialProfile(platformUrl);
    console.log(`✅ LENS: Got real data — @${scrapedData.username}, followers=${scrapedData.followers}, posts=${scrapedData.recentPosts.length}`);

    // 2. Build deep analysis prompt
    const platformLabel = {
      facebook: "فيسبوك",
      instagram: "إنستجرام",
      tiktok: "تيك توك",
      x: "إكس (تويتر)"
    }[scrapedData.platform] || scrapedData.platform;

    const engagementRate = scrapedData.engagementRate || "غير محسوب";
    const postsData = scrapedData.recentPosts.slice(0, 10).map((p, i) => {
      const metrics = [
        p.likes !== undefined ? `${p.likes.toLocaleString()} لايك` : null,
        p.comments !== undefined ? `${p.comments.toLocaleString()} تعليق` : null,
        p.views !== undefined && p.views > 0 ? `${p.views.toLocaleString()} مشاهدة` : null,
      ].filter(Boolean).join(" | ");

      return `${i + 1}. [${p.mediaType || "صورة"}] ${(p.caption || "—").substring(0, 150)} (${metrics || "لا توجد إحصائيات"})`;
    }).join("\n");

    const hasRealData = scrapedData.followers > 0 || scrapedData.recentPosts.length > 0;

    const systemPrompt = `أنت خبير عالمي في تحليل وتدقيق حسابات السوشيال ميديا (Social Media Audit Expert). 
مهمتك إعداد تقرير تشخيصي عميق ومفصل بناءً على البيانات الحقيقية المُستخرجة أدناه.

══════════════════════════════════
📋 بيانات الحساب الحقيقية المُستخرجة
══════════════════════════════════
المنصة: ${platformLabel}
رابط الحساب: ${platformUrl}
نوع الحساب: ${type === "company" ? "شركة / علامة تجارية" : "علامة شخصية / صانع محتوى"}
أهداف العميل: ${goals.join("، ")}

📊 إحصائيات حقيقية:
- اسم المستخدم: @${scrapedData.username}
- الاسم الظاهر: ${scrapedData.displayName || "—"}
${scrapedData.followers > 0 ? `- المتابعون: ${scrapedData.followers.toLocaleString()}` : "- المتابعون: لم يُستخرج"}
${scrapedData.following ? `- يتابع: ${scrapedData.following.toLocaleString()}` : ""}
${scrapedData.postsCount ? `- إجمالي المنشورات: ${scrapedData.postsCount.toLocaleString()}` : ""}
${scrapedData.avgLikes !== undefined ? `- متوسط اللايكات: ${scrapedData.avgLikes.toLocaleString()}` : ""}
${scrapedData.avgComments !== undefined ? `- متوسط التعليقات: ${scrapedData.avgComments.toLocaleString()}` : ""}
${scrapedData.avgViews ? `- متوسط المشاهدات: ${scrapedData.avgViews.toLocaleString()}` : ""}
- معدل التفاعل المحسوب: ${engagementRate}
- حساب موثق: ${scrapedData.isVerified ? "✅ نعم" : "❌ لا"}
- التصنيف: ${scrapedData.category || "—"}
- الرابط الخارجي: ${scrapedData.externalUrl || "—"}

📝 البايو الحقيقي:
"${scrapedData.bio || "—"}"
تقييم البايو: ${scrapedData.bioQuality}

📱 تحليل المحتوى الإجمالي: ${scrapedData.contentQuality}

${hasRealData && postsData ? `📌 آخر ${scrapedData.recentPosts.length} منشور حقيقي:
${postsData}` : "⚠️ لا تتوفر بيانات منشورات"}

══════════════════════════════════
📊 معايير الصناعة (للمقارنة):
══════════════════════════════════
- معدل التفاعل الممتاز: >6% | الجيد: 3%-6% | المتوسط: 1%-3% | الضعيف: <1%
- معدل نشر الشركات الناجحة: 4-7 مرات أسبوعياً على إنستجرام، 1-3 يومياً على تيك توك
- البايو المثالي: 100-150 حرف يتضمن عرض القيمة + CTA + رابط
══════════════════════════════════

المطلوب منك: اكتب تقريراً تشخيصياً شاملاً ومفصلاً يتضمن الأقسام التالية بالضبط:

## 🎯 الخلاصة التنفيذية
فقرة قصيرة تلخص أداء الحساب بالأرقام الحقيقية المذكورة أعلاه. كن دقيقاً في الأرقام.

## 🆔 تحليل الهوية والبراند
حلّل: ثبات الهوية البصرية، وضوح الرسالة التسويقية، البايو، الاسم، والتصنيف.

## 📊 تحليل التفاعل والوصول
بناءً على الأرقام الحقيقية: هل معدل التفاعل جيد؟ مقارنة بالمعيار. أي المنشورات الأعلى أداءً ولماذا؟

## 📝 تحليل المحتوى
نوع المحتوى، الأسلوب، التنوع، وجود الـ Hook، وجود CTA، التوافق مع الأهداف.

## 💪 نقاط القوة
3-4 نقاط قوة حقيقية مستندة للبيانات.

## ⚠️ نقاط الضعف والثغرات الحرجة  
3-5 ثغرات حقيقية مستندة للبيانات. كن صريحاً وجريئاً في التشخيص.

## 🔴 الأخطاء القاتلة (إذا وجدت)
أي أخطاء تسبب خسارة مباشرة في العملاء أو المتابعين.

## 📈 فرص النمو
3 فرص نمو حقيقية غير مستغلة بناءً على الحساب وأهداف العميل.

## 🗓 خطة العمل التنفيذية (30 يوم)
### الأسبوع 1: الأساس (التصحيح والإصلاح)
### الأسبوع 2-3: البناء (تنفيذ الاستراتيجية)
### الأسبوع 4: القياس والتحسين

## 📌 توصيات الاستراتيجية طويلة الأمد
3 توصيات استراتيجية لتحقيق أهداف العميل: ${goals.join("، ")}

الأسلوب: احترافي، مباشر، مقنع. استخدم الأرقام الحقيقية في كل قسم ممكن. لا تذكر بيانات وهمية.`;

    // 3. AI Deep Analysis
    const result = await callGeminiWithFallback({
      model: "gemini-2.0-flash",
      systemPrompt,
      userPrompt: "قم بإعداد التقرير الكامل الآن بناءً على كل البيانات الحقيقية المعروضة.",
      temperature: 0.7,
      maxOutputTokens: 4096
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      scrapedData: formatForFrontend(scrapedData),
      report: result.text,
      dataQuality: hasRealData ? "real" : "limited"
    });

  } catch (error: any) {
    console.error("Lens Analyze Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function formatForFrontend(data: SocialProfileData): Record<string, any> {
  const platformLabel = {
    facebook: "فيسبوك",
    instagram: "إنستجرام",
    tiktok: "تيك توك",
    x: "إكس"
  }[data.platform] || data.platform;

  return {
    platform: platformLabel,
    username: data.username,
    displayName: data.displayName,
    followers: data.followers || 0,
    following: data.following || 0,
    postsCount: data.postsCount || 0,
    engagementRate: data.engagementRate || "—",
    avgLikes: data.avgLikes || 0,
    avgComments: data.avgComments || 0,
    avgViews: data.avgViews || 0,
    isVerified: data.isVerified || false,
    bio: data.bio || "",
    bioQuality: data.bioQuality,
    contentQuality: data.contentQuality,
    category: data.category || "",
    externalUrl: data.externalUrl || "",
    recentPostsCount: data.recentPosts.length,
    recentPosts: data.recentPosts.slice(0, 12),  // Send ALL posts to UI
    dataSource: data.dataSource
  };
}

