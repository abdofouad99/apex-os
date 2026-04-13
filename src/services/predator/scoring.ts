export interface LeadScoringInput {
  hasWebsite: boolean;
  hasPhone: boolean;
  hasEmail?: boolean;
  rating?: number | null;
  reviewsCount?: number | null;
}

export interface LeadScoreResult {
  score: number;
  label: "HOT" | "WARM" | "COLD" | "ICE";
  breakdown: {
    buyingPower: number;
    need: number;
    accessibility: number;
  };
}

/**
 * خوارزمية تقييم العملاء (Lead Scoring)
 * تعتمد على 3 محاور: القدرة الشرائية (30)، الحاجة (40)، الوصول (30)
 */
export function calculateLeadScore(lead: LeadScoringInput): LeadScoreResult {
  let needScore = 0; // Out of 40
  let accessibilityScore = 0; // Out of 30
  let buyingPowerScore = 0; // Out of 30

  // 1. إمكانية الوصول (30)
  if (lead.hasPhone) accessibilityScore += 18;
  if (lead.hasEmail) accessibilityScore += 12;

  // 2. الحاجة للخدمة (40)
  // العميل الذي لا يملك موقعاً، أو مراجعاته قليلة جداً، لديه حاجة ماسة لخدماتنا
  if (!lead.hasWebsite) needScore += 20;

  if (lead.reviewsCount === null || lead.reviewsCount === undefined || lead.reviewsCount < 10) {
    needScore += 20;
  } else if (lead.reviewsCount < 50) {
    needScore += 10;
  }

  // 3. القدرة الشرائية / الجاهزية (30)
  // نفترض أن العميل الذي لديه تقييم عالي جداً أو مراجعات ضخمة هو "حوت" قد يكون صعب الإقناع (أو لا يحتاجنا)
  // لكن العميل الذي يملك بعض المراجعات (يدل على نشاط قائم وله دخل) نعطيه نقاطاً أعلى للقدرة الشرائية
  if (lead.reviewsCount && lead.reviewsCount > 50) {
    buyingPowerScore += 30;
  } else if (lead.reviewsCount && lead.reviewsCount > 5) {
    buyingPowerScore += 15;
  }

  // حساب المجموع الكلي
  const totalScore = needScore + accessibilityScore + buyingPowerScore;
  const score = Math.min(100, Math.max(0, totalScore));

  let label: "HOT" | "WARM" | "COLD" | "ICE" = "ICE";
  if (score >= 70) label = "HOT";
  else if (score >= 50) label = "WARM";
  else if (score >= 30) label = "COLD";

  return {
    score,
    label,
    breakdown: {
      need: needScore,
      accessibility: accessibilityScore,
      buyingPower: buyingPowerScore
    }
  };
}
