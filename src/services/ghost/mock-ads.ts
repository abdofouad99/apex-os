import { ApifyAdResult } from "./apify-ghost";

export const mockGhostAds: ApifyAdResult[] = [
  {
    adId: "ad_001_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "هل تعانين من مشاكل البشرة؟ 🥺 جبنالك الحل السحري! جلسة ليزر النضارة الشاملة الآن بخصم 50% 💥 لا تفوتي العرض واحجزي الآن عبر الرابط! 😍",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-03-01",
    status: "ACTIVE",
    isActive: true
  },
  {
    adId: "ad_002_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "نصيحة اليوم: ترطيب البشرة قبل النوم أهم خطوات الحفاظ على شبابك 💧✨ شاركيها مع صديقاتك",
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-02-15",
    status: "ACTIVE",
    isActive: true
  },
  {
    adId: "ad_003_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "عرض خاص بمناسبة يوم الأم! 🌸 فاجئي والدتك بهدية تستحقها باقة العناية الشاملة بـ 299 ريال فقط! 🎁",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-03-10",
    status: "ACTIVE",
    isActive: true
  },
  {
    adId: "ad_004_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "كيف تتخلصين من الهالات السوداء بخطوات بسيطة؟ د. سارة توضح لكم في هذا الفيديو القصير 👇 احجز استشارتك المجانية اليوم",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    startDate: "2024-01-20",
    status: "INACTIVE",
    isActive: false
  },
  {
    adId: "ad_005_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "مطلوب فوراً! 🚨 نعلن عن فتح باب التوظيف لوظيفة (أخصائية ليزر). الانضمام لعائلة عيادتنا يتميز برواتب مجزية وبيئة عمل محترفة. أرسل سيرتك الذاتية.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-03-25",
    status: "ACTIVE",
    isActive: true
  },
  {
    adId: "ad_006_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "نتائج مبهرة! ✨ شاهدي الفرق قبل وبعد تقنية الـ HIFU لشد الوجه بدون جراحة. اتصل واستفسر عن الأسعار",
    imageUrl: "https://images.unsplash.com/photo-1611558709798-e009c8fd7706?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-02-05",
    status: "ACTIVE",
    isActive: true
  },
  {
    adId: "ad_007_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "الابتسامة هي مفتاح القلوب ❤️ نوفر لكم أعلى معايير الجودة في تركيب ابتسامة هوليوود الدائمة",
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=500&q=80",
    startDate: "2023-11-10",
    status: "INACTIVE",
    isActive: false
  },
  {
    adId: "ad_008_mock",
    pageName: "Dr. Beauty Clinic",
    adText: "نعتز بثقتكم 🌟 تقييماتكم تدفعنا لنكون الأفضل شكرا لكل من شاركنا تجربته",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80",
    startDate: "2024-03-28",
    status: "ACTIVE",
    isActive: true
  }
];

export async function getMockAdsResults() {
  await new Promise(r => setTimeout(r, 2000));
  return mockGhostAds;
}
