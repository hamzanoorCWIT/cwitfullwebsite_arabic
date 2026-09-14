import { fetchAboutUsPage, getAboutUsPageFields } from "@/app/lib/about-us-api";
import {
  normalizeAboutUsPage,
  resolveAboutContentSource,
} from "@/app/lib/about-us-normalize";
import { fetchHomePage, getHomePageFields } from "@/app/lib/home-api";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import type {
  HomeClientLogo,
  HomeTestimonialItem,
} from "@/app/lib/home-normalize";

export interface AboutProofContent {
  testimonials: HomeTestimonialItem[];
  clientLogos: HomeClientLogo[];
}

export async function fetchAboutProofContent(
  logContext: string,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<AboutProofContent> {
  try {
    let aboutFields = null;
    try {
      const aboutResponse = await fetchAboutUsPage(locale);
      aboutFields = getAboutUsPageFields(aboutResponse);
    } catch {
      aboutFields = null;
    }

    const needsHomeContent =
      resolveAboutContentSource(aboutFields?.aboutTestimonialsSource) ===
        "from_home" ||
      resolveAboutContentSource(aboutFields?.aboutClientLogosSource) ===
        "from_home";

    let homeFields = null;
    if (needsHomeContent) {
      try {
        const homeResponse = await fetchHomePage(locale);
        homeFields = homeResponse.data
          ? getHomePageFields(homeResponse.data)
          : null;
      } catch {
        homeFields = null;
      }
    }

    const aboutData = normalizeAboutUsPage(aboutFields, homeFields);
    return {
      testimonials: aboutData.testimonials,
      clientLogos: aboutData.clientLogos,
    };
  } catch (error) {
    console.error(`[${logContext}] Failed to fetch testimonials/client logos:`, error);
    return { testimonials: [], clientLogos: [] };
  }
}
