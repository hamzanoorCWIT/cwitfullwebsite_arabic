import type { AppLocale } from "@/app/lib/locale";

export type HomeUiCopy = {
  featuredWork: string;
  ideasBroughtToLife: string;
  viewAllProjects: string;
  featuredProjects: string;
  portfolioNavigation: string;
  portfolioSlides: string;
  viewProject: (title: string) => string;
  showProject: (title: string) => string;
  nextProject: (title: string) => string;
  previousProject: (title: string) => string;
  showingProject: (title: string) => string;
  viewDetailsFor: (title: string) => string;
  getStartedTitle: string;
  getStartedBody: string;
  startYourProject: string;
  getStartedImageAlt: string;
  readMore: string;
  services: string;
  serviceDetails: string;
  closeServiceDetails: string;
  testimonialSlides: string;
  previousTestimonial: string;
  nextTestimonial: string;
};

const HOME_UI_COPY: Record<AppLocale, HomeUiCopy> = {
  en: {
    featuredWork: "Featured Work",
    ideasBroughtToLife: "Ideas Brought to Life.",
    viewAllProjects: "View All Projects",
    featuredProjects: "Featured projects",
    portfolioNavigation: "Portfolio navigation",
    portfolioSlides: "Portfolio slides",
    viewProject: (title) => `View ${title}`,
    showProject: (title) => `Show ${title}`,
    nextProject: (title) => `Next project: ${title}`,
    previousProject: (title) => `Previous project: ${title}`,
    showingProject: (title) => `Showing ${title}`,
    viewDetailsFor: (title) => `View details for ${title}`,
    getStartedTitle: "Let's Build Something That Lasts.",
    getStartedBody:
      "Whether you're launching a new brand, modernising an existing platform, or exploring AI for the first time, we're ready to help you take the next step.",
    startYourProject: "Start Your Project",
    getStartedImageAlt: "Mobile commerce experience designed by ClearWave",
    readMore: "Read more",
    services: "Services",
    serviceDetails: "Service details",
    closeServiceDetails: "Close service details",
    testimonialSlides: "Testimonial slides",
    previousTestimonial: "Previous testimonial",
    nextTestimonial: "Next testimonial",
  },
  ar: {
    featuredWork: "أعمال مميزة",
    ideasBroughtToLife: "أفكار تتحول إلى واقع.",
    viewAllProjects: "عرض جميع المشاريع",
    featuredProjects: "المشاريع المميزة",
    portfolioNavigation: "تصفح الأعمال",
    portfolioSlides: "شرائح الأعمال",
    viewProject: (title) => `عرض ${title}`,
    showProject: (title) => `إظهار ${title}`,
    nextProject: (title) => `المشروع التالي: ${title}`,
    previousProject: (title) => `المشروع السابق: ${title}`,
    showingProject: (title) => `عرض ${title}`,
    viewDetailsFor: (title) => `عرض تفاصيل ${title}`,
    getStartedTitle: "لنبنِ شيئاً يدوم.",
    getStartedBody:
      "سواء كنت تطلق علامة تجارية جديدة، أو تحدّث منصة قائمة، أو تستكشف الذكاء الاصطناعي لأول مرة، نحن جاهزون لمساعدتك في اتخاذ الخطوة التالية.",
    startYourProject: "ابدأ مشروعك",
    getStartedImageAlt: "تجربة تجارة إلكترونية صممها ClearWave",
    readMore: "اقرأ المزيد",
    services: "الخدمات",
    serviceDetails: "تفاصيل الخدمة",
    closeServiceDetails: "إغلاق تفاصيل الخدمة",
    testimonialSlides: "شرائح آراء العملاء",
    previousTestimonial: "الرأي السابق",
    nextTestimonial: "الرأي التالي",
  },
};

export function getHomeUiCopy(locale: AppLocale): HomeUiCopy {
  return HOME_UI_COPY[locale] ?? HOME_UI_COPY.en;
}

type HomeUiTextKey =
  | "featuredWork"
  | "ideasBroughtToLife"
  | "viewAllProjects"
  | "readMore"
  | "serviceDetails";

/** Use CMS text when present; if Arabic still has the English fallback, use the Arabic copy. */
export function resolveHomeUiText(
  locale: AppLocale,
  cmsValue: string | undefined,
  key: HomeUiTextKey
): string {
  const copy = getHomeUiCopy(locale);
  const cms = cmsValue?.trim() || "";
  if (!cms) return copy[key];
  if (locale === "ar" && cms === HOME_UI_COPY.en[key]) return copy[key];
  return cms;
}
