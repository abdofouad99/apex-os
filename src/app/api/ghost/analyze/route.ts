import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithFallback } from "@/lib/gemini-rotator";

export async function POST(req: NextRequest) {
  try {
    const { ads, pageUrl, pageName, noAdsMode, adStatus, pageInfo, isOrganicFallback } = await req.json();

    if (!pageUrl) {
      return NextResponse.json({ error: "pageUrl مطلوب" }, { status: 400 });
    }


    let systemPrompt = `أنت خبير عالمي في تحليل إعلانات السوشيال ميديا وتسويق الأداء (Performance Marketing Expert).`;
    let userPrompt = "";

    // ── Organic Posts Mode ──
    if (isOrganicFallback && ads?.length > 0) {
      systemPrompt += `\nمهمتك تحليل المنشورات العضوية (غير المدفوعة) لصفحة تجارية على Facebook وإعداد تقرير استراتيجي للمحتوى.`;

      const postsText = ads.slice(0, 10).map((p: any, i: number) =>
        `منشور #${i + 1}:\n${(p.adText || "(بدون نص)").substring(0, 200)}${p.startDate ? `\nالتاريخ: ${new Date(p.startDate).toLocaleDateString("ar")}` : ""}`
      ).join("\n\n──────────────\n\n");

      userPrompt = `
══════════════════════════════════
📋 منشورات صفحة: ${pageName || pageUrl}
عدد المنشورات: ${ads.length}
ملاحظة: هذه منشورات عضوية — الصفحة لا تملك إعلانات مدفوعة
══════════════════════════════════
${postsText}

══════════════════════════════════
📊 تقرير مطلوب:
══════════════════════════════════

### ## 📊 تحليل استراتيجية المحتوى
ما نوع المحتوى الذي تنشره هذه الصفحة؟ وما أسلوبها في التواصل؟

### ## 💪 نقاط القوة في المحتوى
ما الجوانب الإيجابية في محتوى الصفحة؟

### ## ⚠️ نقاط الضعف والفرص الضائعة
ما الذي يمكن تحسينه؟ وما الفرص المفوّتة؟

### ## 🎯 الجمهور المستهدف
من هو الجمهور المناسب لهذه الصفحة بناءً على محتواها؟

### ## 🚀 توصيات لتطوير المحتوى
5 توصيات عملية لتحسين المحتوى وزيادة التفاعل

### ## 💰 هل تحتاج إلى إعلانات مدفوعة؟
لماذا يجب على هذه الصفحة البدء في الإعلانات المدفوعة؟ وكيف؟

قدّم التقرير بالعربية، عملياً ومحدداً.
`;
    // ── No Ads Mode ──
    } else if (noAdsMode || !ads?.length) {

      systemPrompt += `\nمهمتك تحليل وضع صفحة تجارية على Facebook لا تملك أي إعلانات مدفوعة، وتقديم توصيات استراتيجية.`;

      userPrompt = `
══════════════════════════════════
📋 معلومات الصفحة المفحوصة
══════════════════════════════════
الصفحة: ${pageName || pageUrl}
الرابط: ${pageUrl}
حالة الإعلانات: ${adStatus || "This Page isn't currently running ads"}
${pageInfo?.page_id ? `معرف الصفحة: ${pageInfo.page_id}` : ""}
${pageInfo?.creation_date ? `تاريخ إنشاء الصفحة: ${pageInfo.creation_date}` : ""}

══════════════════════════════════
📊 تقرير مطلوب بالأقسام التالية:
══════════════════════════════════

### ## 🔍 تشخيص الوضع الراهن
لماذا يعتبر عدم الإعلان في 2025 خطراً تنافسياً خطيراً؟ وكيف يؤثر على هذا النشاط التجاري؟

### ## 📉 التكلفة الخفية لعدم الإعلان
ما الفرص الضائعة التي تتكبدها هذه الصفحة يومياً بسبب غياب الإعلانات؟

### ## 🎯 استراتيجية البداية المثلى
ما هي أول 3 حملات إعلانية يجب إطلاقها فوراً؟ (بتفاصيل عملية: الهدف، الجمهور، النوع)

### ## 💰 ميزانية البداية المقترحة
كيف توزع ميزانية (500-2000 ريال/شهر) للحصول على أعلى عائد؟

### ## 🚀 خطة 30 يوم لبدء الإعلان
خطة أسبوع بأسبوع للانطلاق الإعلاني من الصفر

### ## ⚠️ الأخطاء التي يجب تجنبها
ما الأخطاء الشائعة عند البدء وكيف تتفاداها؟

قدّم التقرير بالعربية، عملياً ومحدداً وقابلاً للتطبيق فوراً.
`;

    } else {
      // ── Ads Mode: Analyze real ads ──
      systemPrompt += `\nمهمتك تحليل مجموعة إعلانات حقيقية من مكتبة إعلانات Facebook وإعداد تقرير استراتيجي شامل.`;

      const adsText = ads.slice(0, 15).map((ad: any, i: number) => {
        const parts = [
          `إعلان #${i + 1} [${ad.isActive ? "نشط ✅" : "منتهي ⛔"}]`,
          ad.adText ? `النص: ${ad.adText.substring(0, 250)}` : "(بدون نص)",
          ad.imageUrl ? "📷 يحتوي صورة" : "",
          ad.videoUrl ? "🎬 يحتوي فيديو" : "",
          ad.startDate ? `تاريخ البداية: ${ad.startDate}` : "",
        ].filter(Boolean).join("\n");
        return parts;
      }).join("\n\n──────────────\n\n");

      const activeCount = ads.filter((a: any) => a.isActive).length;

      userPrompt = `
══════════════════════════════════
📋 بيانات الإعلانات الحقيقية
══════════════════════════════════
الصفحة: ${pageName || pageUrl}
إجمالي الإعلانات: ${ads.length}
الإعلانات النشطة: ${activeCount}
تحتوي على فيديو: ${ads.some((a: any) => a.videoUrl) ? "نعم" : "لا"}
تحتوي على صور: ${ads.some((a: any) => a.imageUrl) ? "نعم" : "لا"}

══════════════════════════════════
📝 نماذج الإعلانات (${Math.min(ads.length, 15)} إعلان):
══════════════════════════════════
${adsText}

══════════════════════════════════
📊 تقرير مطلوب بالأقسام التالية:
══════════════════════════════════

### ## 🎯 الاستراتيجية الإعلانية
اشرح الاستراتيجية العامة (وعي؟ تحويل؟ تفاعل؟)

### ## 💡 أقوى الإعلانات وأسباب نجاحها
حدد 2-3 إعلانات قوية مع تفسير سبب فعاليتها

### ## ⚠️ نقاط الضعف والثغرات
ما الذي يفتقده هذا المعلن؟

### ## 🔥 الأنماط المتكررة
ما الأساليب التي يكررها المعلن؟

### ## 🎯 الجمهور المستهدف
استنتج الجمهور بناءً على لغة ومحتوى الإعلانات

### ## 🚀 كيف تتفوق على هذه الإعلانات
أفكار عملية ومحددة للتفوق على المنافس

### ## 📅 خطة إعلانية مقترحة (30 يوم)
خطة شهرية مبنية على ما تعلمته من هذه الإعلانات

قدّم التقرير بالعربية، منظماً وعملياً وقابلاً للتطبيق فوراً.
`;
    }

    const result = await callGeminiWithFallback({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 3000,
      temperature: 0.7
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      report: result.text,
      source: result.source,
      adsAnalyzed: ads?.length || 0,
      mode: (noAdsMode || !ads?.length) ? "no-ads" : "with-ads"
    });

  } catch (error: any) {
    console.error("Ghost analyze error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
