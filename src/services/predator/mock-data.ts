export const mockLeads = [
  {
    title: "عيادة ديرما بيوتي التجميلية",
    website: "", // No website -> HIGH Need
    phone: "+966501234567",
    categoryName: "عيادة تجميل",
    rating: 3.2,
    reviewsCount: 8, // Low reviews -> HIGH Need
    city: "الرياض",
  },
  {
    title: "مجمع النخبة الطبى",
    website: "https://elite-clinic-mock.com",
    phone: "+966500000001",
    categoryName: "مركز طبي",
    rating: 4.8,
    reviewsCount: 350, // High reviews -> WARM/COLD Need, but High Buying Power
    city: "الرياض",
  },
  {
    title: "أكاديمية العناية والصحة",
    website: "",
    phone: "", // No phone, no website -> ICE/COLD accessibility
    categoryName: "مركز عناية",
    rating: 4.0,
    reviewsCount: 3,
    city: "جدة",
  },
  {
    title: "مستوصف ابتسامة لطب الأسنان",
    website: "https://smile-dental-mock.com",
    phone: "+966555123123",
    categoryName: "عيادة أسنان",
    rating: 2.5,
    reviewsCount: 40,
    city: "الرياض",
  },
  {
    title: "صالون لمسات للسيدات",
    website: "",
    phone: "+966533333333",
    categoryName: "صالون تجميل",
    rating: 4.9,
    reviewsCount: 120,
    city: "دبي",
  },
  {
    title: "مركز الطب الشامل",
    website: "",
    phone: "+966544444444",
    categoryName: "مستشفى",
    rating: 3.8,
    reviewsCount: 15,
    city: "مكة",
  },
  {
    title: "عيادات الليزر المتقدمة",
    website: "https://laser-adv-mock.com",
    phone: "+966566666666",
    categoryName: "عيادة ليزر",
    rating: 4.6,
    reviewsCount: 85,
    city: "الدمام",
  },
  {
    title: "مركز صفاء للبشرة",
    website: "",
    phone: "",
    categoryName: "مركز عناية بالبشرة",
    rating: 5.0,
    reviewsCount: 2,
    city: "الرياض",
  },
  {
    title: "مجمع عيادات الأندلس",
    website: "https://andalus-clinics-mock.com",
    phone: "+966577777777",
    categoryName: "مجمع طبى",
    rating: 4.1,
    reviewsCount: 200,
    city: "جدة",
  },
  {
    title: "عيادة دكتور تجميل د. أحمد",
    website: "",
    phone: "+966588888888",
    categoryName: "عيادة تجميل",
    rating: 3.5,
    reviewsCount: 22,
    city: "دبي",
  },
  {
    title: "خبراء التغذية دايت سنتر",
    website: "https://diet-center-mock.com",
    phone: "+966599999999",
    categoryName: "مركز تغذية",
    rating: 4.3,
    reviewsCount: 65,
    city: "الرياض",
  },
  {
    title: "مركز لياقتي للرياضة النسائية",
    website: "",
    phone: "+966500009999",
    categoryName: "نادي رياضي",
    rating: 4.7,
    reviewsCount: 4,
    city: "الخبر",
  }
];

export async function getMockRunResults() {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return mockLeads;
}
