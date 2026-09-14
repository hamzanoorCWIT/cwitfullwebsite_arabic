import type { Metadata } from "next";
import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import Accordion from "../components/sections/Accordion";
import ContactForm from "../components/ui/ContactForm";
import GoogleMapSection from "../components/sections/GoogleMapSection";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { fetchDefaultContactPage, getContactPageFields, CONTACT_PAGE_URI } from "@/app/lib/contact-api";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import {
  parseNumber,
  resolveContactFormProps,
  trimString,
} from "@/app/lib/contact-form-config";
import { resolveImageUrl } from "@/app/lib/our-work-api";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchSeoByUri(CONTACT_PAGE_URI);
    return yoastSeoToMetadata(seo);
  } catch {
    return {};
  }
}

export default async function ContactUsPage() {
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchSeoByUri(CONTACT_PAGE_URI);
  } catch (error) {
    console.error("[contact-us] Failed to fetch Yoast SEO:", error);
    seo = null;
  }

  let fields = null;
  try {
    const res = await fetchDefaultContactPage();
    fields = getContactPageFields(res.data);
  } catch (error) {
    console.error("Failed to fetch Contact Us page data:", error);
  }

  const bannerTitle = fields?.contactBanner?.bannerTitle?.trim() || "";
  const bannerDescription = fields?.contactBanner?.bannerDescription?.trim() || "";
  const bannerBgUrl = fields?.contactBanner?.bannerBackgroundImage?.node?.sourceUrl;
  const formSettings = (fields?.contactFormSettings ?? undefined) as Record<string, unknown> | undefined;
  const contactForm = resolveContactFormProps(formSettings);

  const accordionTitle = fields?.contactAccordionTitle?.trim() || "";
  const accordionItems = fields?.contactAccordionItems?.length
    ? fields.contactAccordionItems.map((item, i) => ({
        id: i + 1,
        title: item.faqTitle || "",
        content: item.faqContent || "",
      }))
    : undefined;
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/contact-us/",
    pageTitle: bannerTitle || "Contact Us",
    faqs: accordionItems,
  });

  const locations = fields?.contactMapLocations?.length
    ? fields.contactMapLocations
        .map((loc) => {
          const latitude = parseNumber(loc.latitude);
          const longitude = parseNumber(loc.longitude);
          const name = trimString(loc.name);
          if (!name || latitude == null || longitude == null) return null;
          return {
            name,
            address: trimString(loc.address) || "",
            latitude,
            longitude,
          };
        })
        .filter((loc): loc is { name: string; address: string; latitude: number; longitude: number } => !!loc)
    : undefined;

  const resolvedBannerBg = bannerBgUrl ? resolveImageUrl(bannerBgUrl) : undefined;

  return (
    <main className="min-h-screen">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      <DigitalExperienceBanner
        title={<>{bannerTitle}</>}
        description={bannerDescription || undefined}
        backgroundImage={
          resolvedBannerBg
            ? { src: resolvedBannerBg, alt: "Background" }
            : undefined
        }
        contactForm={
          <ContactForm
            fields={contactForm.fields}
            submitButtonText={contactForm.submitButtonText}
            successMessage={contactForm.successMessage}
          />
        }
      />
      <GoogleMapSection locations={locations && locations.length > 0 ? locations : undefined} />
      {accordionItems && accordionItems.length > 0 ? (
        <Accordion title={accordionTitle} items={accordionItems} />
      ) : null}
    </main>
  );
}
