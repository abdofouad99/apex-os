export interface AdAnalysis {
  hasOffer: boolean;
  offerText: string | null;
  sentiment: "positive" | "neutral" | "negative";
  hookScore: number;
  mainTopic: "ترويج" | "توعية" | "عرض" | "حجز" | "تعليم" | "توظيف" | "أخرى";
}

export interface BatchAnalysisResult {
  totalAds: number;
  activeAds: number;
  promoCount: number;
  offerCount: number;
  avgHookScore: number;
  recommendation: string;
}

const OFFER_KEYWORDS = ["%خصم", "خصم", "عرض", "مجانا", "مجانًا", "تخفيض", "سعر خاص", "%", "offer", "discount", "free"];
const POSITIVE_KEYWORDS = ["متميز", "رائع", "الأفضل", "جمال", "تألق", "علاج", "ابتسامة", "سعادة", "فرصة", "عظيم", "أقوى", "جديد", "حصري", "خبرة"];
const NEGATIVE_KEYWORDS = ["مشاكل", "ألم", "معاناة", "ضيق", "صعوبة", "تعب", "إرهاق", "خطر", "احذر", "قلق"];
const BOOKING_KEYWORDS = ["احجز", "موعد", "استشارة", "تواصل", "سجل", "اتصل", "رابط", "book", "call"];
const EDU_KEYWORDS = ["نصيحة", "معلومة", "هل تعلم", "كيف", "نصائح", "فوائد", "طريقة", "لماذا"];
const HIRING_KEYWORDS = ["توظيف", "شواغر", "مطلوب", "انضم", "فرصة عمل", "وظيفة", "career", "hiring"];

export function analyzeAd(text: string | undefined): AdAnalysis {
  if (!text) {
    return { hasOffer: false, offerText: null, sentiment: "neutral", hookScore: 0, mainTopic: "أخرى" };
  }

  const lowerText = text.toLowerCase();
  
  // 1. Detect Offer
  let hasOffer = false;
  let offerText = null;
  for (const kw of OFFER_KEYWORDS) {
    if (lowerText.includes(kw)) {
      hasOffer = true;
      // Extract brief context around offer
      const idx = lowerText.indexOf(kw);
      offerText = text.substring(Math.max(0, idx - 15), Math.min(text.length, idx + 40)).replace(/\n/g, ' ').trim();
      break;
    }
  }

  // 2. Detect Sentiment
  let posCount = 0;
  let negCount = 0;
  POSITIVE_KEYWORDS.forEach(kw => { if (lowerText.includes(kw)) posCount++; });
  NEGATIVE_KEYWORDS.forEach(kw => { if (lowerText.includes(kw)) negCount++; });

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  if (posCount > negCount) sentiment = "positive";
  else if (negCount > posCount) sentiment = "negative";

  // 3. Main Topic
  let mainTopic: AdAnalysis["mainTopic"] = "ترويج";
  if (hasOffer) mainTopic = "عرض";
  else if (HIRING_KEYWORDS.some(kw => lowerText.includes(kw))) mainTopic = "توظيف";
  else if (EDU_KEYWORDS.some(kw => lowerText.includes(kw))) mainTopic = "تعليم";
  else if (BOOKING_KEYWORDS.some(kw => lowerText.includes(kw))) mainTopic = "حجز";
  else if (posCount > 3) mainTopic = "توعية";

  // 4. Hook Score (out of 10)
  // Longer text implies storytelling, questions imply engagement, emojis imply attention.
  let hookScore = 5;
  if (text.includes("؟") || text.includes("?")) hookScore += 2;
  if (hasOffer) hookScore += 2;
  const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/gu;
  if (emojiRegex.test(text)) hookScore += 1;
  if (posCount > 0 || negCount > 0) hookScore += 1;
  if (text.length > 500) hookScore += 1; // Story style
  else if (text.length < 50) hookScore -= 2; // Too short or empty

  hookScore = Math.max(1, Math.min(10, hookScore));

  return { hasOffer, offerText, sentiment, hookScore, mainTopic };
}

export function analyzeAdsBatch(ads: any[]): BatchAnalysisResult {
  let promoCount = 0;
  let offerCount = 0;
  let totalHook = 0;
  let activeAds = 0;

  for (const ad of ads) {
    if (ad.isActive !== false) activeAds++;
    if (ad.mainTopic === "عرض" || ad.mainTopic === "ترويج" || ad.mainTopic === "حجز") promoCount++;
    if (ad.hasOffer) offerCount++;
    totalHook += (ad.hookScore || 0);
  }

  const avgHookScore = ads.length > 0 ? Math.round(totalHook / ads.length) : 0;
  const offerPercentage = ads.length > 0 ? (offerCount / ads.length) * 100 : 0;

  let recommendation = "قم بدراسة محتوى المنافس.";
  if (offerPercentage > 50) recommendation = "المنافس يعتمد بشدة على تقديم العروض والتخفيضات.";
  else if (avgHookScore > 7) recommendation = "نصوص إعلانات المنافس جذابة جداً ותستخدم أسلوب طرح الأسئلة أو القصص.";
  else if (promoCount < ads.length / 2) recommendation = "المنافس يركز على المحتوى التوعوي أو التعليمي أكثر من البيع المباشر.";

  return {
    totalAds: ads.length,
    activeAds,
    promoCount,
    offerCount,
    avgHookScore,
    recommendation
  };
}
