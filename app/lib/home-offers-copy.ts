import type { AppLocale } from "@/app/lib/locale";
import type { HomeOfferCard, OfferModalContent } from "@/app/lib/home-offers-types";
import type { StudioServiceCard } from "@/app/components/sections/StudioServiceCards";

type OfferCardCopy = {
  title: string;
  description: string;
};

/** Hardcoded English titles → Arabic. Used only when the live title still matches. */
const OFFER_AR_TITLES: Array<[string, string]> = [
  ["Website Design & Development", "تصميم وتطوير المواقع"],
  ["Ecommerce Solutions", "حلول التجارة الإلكترونية"],
  ["CMS & Integrations", "أنظمة إدارة المحتوى والتكامل"],
  ["UI/UX, Design System", "تجربة المستخدم ونظام التصميم"],
  ["UI/UX Design System", "تجربة المستخدم ونظام التصميم"],
  ["Web Application Development", "تطوير تطبيقات الويب"],
  ["Web/Mobile Application Development", "تطوير تطبيقات الويب والجوال"],
  ["Mobile Application Development", "تطوير تطبيقات الجوال"],
  ["Enterprise Platforms", "منصات المؤسسات"],
  ["API & System Integrations", "واجهات البرمجة وتكامل الأنظمة"],
  ["Search Engine Optimisation", "تحسين محركات البحث"],
  ["Search Engine Optimization", "تحسين محركات البحث"],
  ["SEO", "تحسين محركات البحث"],
  ["Content Strategy", "استراتيجية المحتوى"],
  ["Branding, Identity & Strategy", "الهوية البصرية والاستراتيجية"],
  ["Digital Marketing", "التسويق الرقمي"],
  ["AI Agents", "وكلاء الذكاء الاصطناعي"],
  ["Conversational AI", "الذكاء الاصطناعي الحواري"],
  ["AI Strategy & Consulting", "استراتيجية واستشارات الذكاء الاصطناعي"],
  ["AI Workflow Automation", "أتمتة سير العمل بالذكاء الاصطناعي"],
];

/**
 * Hardcoded English descriptions → Arabic.
 * Includes the short carousel lines and the longer popup/studio-card copy.
 * Custom CMS text that does not match these strings is left unchanged.
 */
const OFFER_AR_DESCRIPTIONS: Array<[string, string]> = [
  [
    "Every great business deserves a website that people remember.",
    "كل عمل ناجح يستحق موقعاً يتذكره الناس.",
  ],
  [
    "Shopping online should feel effortless from the first product to the final payment.",
    "التسوق عبر الإنترنت يجب أن يكون سهلاً من أول منتج حتى إتمام الدفع.",
  ],
  [
    "Content should be simple to manage, powerful enough to grow.",
    "يجب أن يكون المحتوى سهلاً في الإدارة وقوياً بما يكفي للنمو.",
  ],
  [
    "Great digital experiences begin long before someone clicks a button.",
    "التجارب الرقمية الرائعة تبدأ قبل أن يضغط أحد على زر.",
  ],
  [
    "The best software doesn't just solve problems. It makes work feel simpler.",
    "أفضل البرمجيات لا تحل المشكلات فقط، بل تجعل العمل أبسط.",
  ],
  [
    "The most valuable digital experiences are the ones your customers carry every day.",
    "أغلى التجارب الرقمية هي التي يحملها عملاؤك كل يوم.",
  ],
  [
    "Business systems should adapt to your organisation, not the other way around.",
    "أنظمة العمل يجب أن تتكيف مع مؤسستك، لا العكس.",
  ],
  [
    "The strongest digital ecosystems are the ones that work together.",
    "أقوى الأنظمة الرقمية هي التي تعمل معاً.",
  ],
  [
    "The best website in the world means very little if the right people never discover it.",
    "أفضل موقع في العالم لا يعني شيئاً إن لم يكتشفه الأشخاص المناسبون.",
  ],
  [
    "Every successful brand has a story worth sharing.",
    "لكل علامة تجارية ناجحة قصة تستحق أن تُروى.",
  ],
  [
    "A memorable brand is built long before a logo is recognised.",
    "العلامة التي تُذكر تُبنى قبل أن يُعرف الشعار بوقت طويل.",
  ],
  [
    "Growth is meaningful only when it can be measured.",
    "النمو ذو معنى فقط عندما يمكن قياسه.",
  ],
  [
    "Tomorrow's businesses won't work harder. They'll work smarter with intelligent systems.",
    "أعمال الغد لن تعمل بجهد أكبر، بل بذكاء أكبر عبر أنظمة ذكية.",
  ],
  [
    "Natural conversations create stronger customer relationships.",
    "المحادثات الطبيعية تبني علاقات أقوى مع العملاء.",
  ],
  [
    "Reduce repetitive work and give your team more time to create value.",
    "قلّل العمل المتكرر وامنح فريقك وقتاً أكبر لصنع القيمة.",
  ],
  [
    "Technology creates value only when applied with purpose.",
    "التقنية تخلق قيمة فقط عندما تُستخدم بهدف واضح.",
  ],
  [
    "We design and develop custom websites that balance beautiful design with performance, usability, and scalability. Every website is built around your business objectives, helping visitors become customers while creating a strong foundation for future growth.",
    "نصمّم ونطوّر مواقع مخصصة تجمع بين التصميم الجميل والأداء وسهولة الاستخدام وقابلية التوسع. يُبنى كل موقع حول أهداف عملك، ليحوّل الزوار إلى عملاء ويضع أساساً قوياً للنمو المستقبلي.",
  ],
  [
    "From boutique online stores to enterprise ecommerce platforms, we build secure, scalable shopping experiences that increase conversions while making day-to-day management simple for your team.",
    "من المتاجر الإلكترونية الصغيرة إلى منصات التجارة المؤسسية، نبني تجارب تسوق آمنة وقابلة للنمو تزيد التحويلات وتجعل الإدارة اليومية بسيطة لفريقك.",
  ],
  [
    "Whether it's WordPress, a headless CMS, or a custom content platform, we build flexible systems and integrate the tools your business relies on to keep everything connected.",
    "سواء كان ووردبريس أو نظام محتوى بدون واجهة أو منصة محتوى مخصصة، نبني أنظمة مرنة ونربط الأدوات التي يعتمد عليها عملك ليبقى كل شيء متصلاً.",
  ],
  [
    "Thoughtful user experience and interface design transform complex interactions into intuitive journeys. We create interfaces that are accessible, engaging, and designed around the way people naturally browse, interact, and make decisions.",
    "تصميم تجربة المستخدم والواجهة المدروس يحوّل التفاعلات المعقدة إلى رحلات بديهية. نصنع واجهات سهلة الوصول وجذابة ومصممة حول طريقة الناس الطبيعية في التصفح والتفاعل واتخاذ القرار.",
  ],
  [
    "We build custom web applications that automate processes, centralise information, and improve collaboration while remaining secure, scalable, and ready for future growth.",
    "نبني تطبيقات ويب مخصصة تؤتمت العمليات وتركّز المعلومات وتحسّن التعاون، مع البقاء آمنة وقابلة للتوسع وجاهزة للنمو المستقبلي.",
  ],
  [
    "We create intuitive iOS and Android applications that connect businesses with customers and empower teams through seamless mobile experiences.",
    "نصنع تطبيقات iOS وAndroid سهلة تربط الشركات بالعملاء وتمكّن الفرق عبر تجارب جوال سلسة.",
  ],
  [
    "From internal business systems to customer portals, we develop enterprise platforms that improve productivity and support long-term digital transformation.",
    "من الأنظمة الداخلية إلى بوابات العملاء، نطوّر منصات مؤسسية تحسّن الإنتاجية وتدعم التحول الرقمي طويل الأمد.",
  ],
  [
    "We connect CRMs, ERPs, payment gateways, cloud services, and third-party platforms to create seamless, intelligent business workflows.",
    "نربط أنظمة إدارة العملاء وتخطيط الموارد وبوابات الدفع والخدمات السحابية والمنصات الخارجية لإنشاء سير عمل تجاري متكامل وذكي.",
  ],
  [
    "Our SEO strategies improve visibility through technical optimisation, quality content, and sustainable organic growth, helping your business get found when it matters most.",
    "تحسّن استراتيجيات تحسين محركات البحث الظهور عبر التحسين التقني والمحتوى الجيد والنمو العضوي المستدام، ليجدك عملاؤك في الوقت المناسب.",
  ],
  [
    "We create strategic content that supports SEO, strengthens your brand, and communicates naturally with both people and AI-powered search.",
    "نصنع محتوى استراتيجياً يدعم تحسين محركات البحث ويقوّي علامتك ويتحدث بوضوح مع الناس ومع البحث المعتمد على الذكاء الاصطناعي.",
  ],
  [
    "We create brand identities and strategies that communicate clearly, build trust, and leave lasting impressions across every customer touchpoint.",
    "نصنع هويات واستراتيجيات علامة تجارية تتحدث بوضوح وتبني الثقة وتترك انطباعاً دائماً في كل نقطة تواصل مع العميل.",
  ],
  [
    "We combine creativity, analytics, and continuous optimisation to attract qualified audiences and improve marketing performance.",
    "نجمع بين الإبداع والتحليل والتحسين المستمر لجذب الجمهور المناسب وتحسين أداء التسويق.",
  ],
  [
    "We develop custom AI agents that support customers, automate tasks, access business knowledge, and improve day-to-day operations.",
    "نطوّر وكلاء ذكاء اصطناعي مخصصين يدعمون العملاء ويؤتمتون المهام ويصلون إلى معرفة العمل ويحسّنون العمليات اليومية.",
  ],
  [
    "We build AI assistants that communicate naturally across websites, messaging platforms, and internal systems while delivering consistent customer experiences.",
    "نبني مساعدين بالذكاء الاصطناعي يتحدثون بطبيعية عبر المواقع ومنصات المراسلة والأنظمة الداخلية مع تقديم تجربة عملاء متسقة.",
  ],
  [
    "We help businesses identify AI opportunities, define practical implementation strategies, and introduce intelligent systems that deliver measurable outcomes.",
    "نساعد الشركات على اكتشاف فرص الذكاء الاصطناعي ووضع خطط تنفيذ عملية وإدخال أنظمة ذكية تحقق نتائج قابلة للقياس.",
  ],
  [
    "We automate manual processes, approvals, reporting, and operational workflows using intelligent automation tailored to your business.",
    "نؤتمت العمليات اليدوية والموافقات والتقارير وسير العمل التشغيلي باستخدام أتمتة ذكية مصممة خصيصاً لعملك.",
  ],
];

function offerKey(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ");
}

function toLookup(pairs: Array<[string, string]>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [english, arabic] of pairs) {
    map[offerKey(english)] = arabic;
  }
  return map;
}

const OFFER_AR_TITLE_BY_EN = toLookup(OFFER_AR_TITLES);
const OFFER_AR_DESCRIPTION_BY_EN = toLookup(OFFER_AR_DESCRIPTIONS);

export function localizeOfferCardText(
  locale: AppLocale,
  title: string,
  description: string
): OfferCardCopy {
  if (locale !== "ar") return { title, description };
  return {
    title: OFFER_AR_TITLE_BY_EN[offerKey(title)] ?? title,
    description: OFFER_AR_DESCRIPTION_BY_EN[offerKey(description)] ?? description,
  };
}

export function localizeOfferCta(
  locale: AppLocale,
  ctaText: string | undefined
): string | undefined {
  const value = ctaText?.trim();
  if (!value) return value;
  if (locale !== "ar") return value;
  if (value === "Get In Touch") return "تواصل معنا";
  if (value === "View More") return "عرض المزيد";
  if (value === "Call To Action") return "تواصل معنا";
  return value;
}

function localizeDetailCard(
  locale: AppLocale,
  card: StudioServiceCard
): StudioServiceCard {
  const text = localizeOfferCardText(locale, card.title, card.description || "");
  return {
    ...card,
    title: text.title,
    description: text.description,
    ctaText: localizeOfferCta(locale, card.ctaText) ?? card.ctaText,
  };
}

function localizeOfferModal(
  locale: AppLocale,
  modal: OfferModalContent
): OfferModalContent {
  const banner = localizeOfferCardText(
    locale,
    modal.bannerTitle,
    modal.bannerDescription
  );
  return {
    ...modal,
    bannerTitle: banner.title,
    bannerDescription: banner.description,
    detailCards: modal.detailCards.map((card) => localizeDetailCard(locale, card)),
  };
}

export function localizeHomeOfferCard(
  locale: AppLocale,
  card: HomeOfferCard
): HomeOfferCard {
  const text = localizeOfferCardText(locale, card.title, card.description);
  return {
    ...card,
    title: text.title,
    description: text.description,
    modalContent: card.modalContent
      ? localizeOfferModal(locale, card.modalContent)
      : undefined,
  };
}
