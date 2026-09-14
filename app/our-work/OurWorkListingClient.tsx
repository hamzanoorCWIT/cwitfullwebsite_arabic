"use client";

import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import bannerStyles from "@/app/components/sections/digital-experience-banner-tuned.module.css";
import type { OurWorkPageItem } from "@/app/our-work/our-work-types";
import Accordion from "../components/sections/Accordion";
import { useRef, useEffect, useState, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  fetchOurWorkListingPage,
  fetchPortfoliosList,
  type OurWorkListingPage,
} from "@/app/lib/our-work-api";
import { mapPortfoliosToOurWorkListingItems } from "@/app/lib/portfolio-listing-card-map";
import { normalizeOurWorkPageData } from "@/app/our-work/our-work-normalize";
import OurWorkProjectGrid from "@/app/our-work/OurWorkProjectGrid";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useScrollTriggerRefresh(deps: unknown[]) {
  useEffect(() => {
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    return () => clearTimeout(t);
  }, deps);
}

type OurWorkListingClientProps = {
  initialData?: OurWorkListingPage | null;
};

export default function OurWorkListingClient({
  initialData = null,
}: OurWorkListingClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [apiData, setApiData] = useState<OurWorkListingPage | null>(initialData);
  const [portfoliosItems, setPortfoliosItems] = useState<OurWorkPageItem[] | null>(null);
  const [portfoliosSlugs, setPortfoliosSlugs] = useState<string[]>([]);
  const [, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => {
    return normalizeOurWorkPageData(apiData);
  }, [apiData]);

  const bannerProps = useMemo(() => normalized.banner, [normalized]);
  const resolvedBannerBg = bannerProps.backgroundImage?.src?.trim() ?? "";

  const workItemsToShow: OurWorkPageItem[] = useMemo(() => {
    if (normalized?.workItems?.length) {
      let portfolioIndex = 0;
      return normalized.workItems.map((item) => {
        if (item.link?.trim()) return item;
        const slug = portfoliosSlugs[portfolioIndex];
        if (slug) {
          portfolioIndex++;
          return { ...item, link: portfolioDetailPath(slug) };
        }
        return item;
      });
    }
    if (portfoliosItems?.length) return portfoliosItems;
    return [];
  }, [normalized, portfoliosItems, portfoliosSlugs]);

  const accordionProps = useMemo(() => {
    const acc = normalized?.accordion;
    const hasItems = (acc?.items?.length ?? 0) > 0;
    return hasItems && acc ? { title: acc.title, items: acc.items } : null;
  }, [normalized]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchOurWorkListingPage()
      .then((res) => {
        if (cancelled) return;
        if (res.errors?.length) {
          setError(res.errors.map((e) => e.message).join(", "));
          return;
        }
        if (res.data?.page) setApiData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load page");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!normalized) return;
    let cancelled = false;
    fetchPortfoliosList()
      .then((res) => {
        if (cancelled) return;
        const nodes = res.data?.portfolios?.nodes?.filter(Boolean) ?? [];
        const slugs = nodes.map((p) => p?.slug?.trim()).filter((s): s is string => !!s);
        setPortfoliosSlugs(slugs);
        if (normalized.workItems.length === 0) {
          const items = mapPortfoliosToOurWorkListingItems(nodes);
          setPortfoliosItems(items);
        } else {
          setPortfoliosItems(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPortfoliosSlugs([]);
          setPortfoliosItems(normalized.workItems.length === 0 ? [] : null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [normalized, apiData]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll(".work-card");
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 80, scale: 0.95 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.15,
    });

    const cardElements = Array.from(cards) as HTMLElement[];
    const onEnter = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      gsap.to(el, {
        scale: 1.02,
        y: -5,
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const onLeave = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      gsap.to(el, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
    };
    cardElements.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      tl.kill();
      cardElements.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === sectionRef.current) trigger.kill();
      });
    };
  }, [workItemsToShow]);

  useScrollTriggerRefresh([
    workItemsToShow.length,
    accordionProps,
    normalized?.accordion?.items?.length,
  ]);

  return (
    <>
    <main className="min-h-screen">
      {error && (
        <div className="bg-amber-900/20 text-amber-200 text-sm text-center py-2 px-4">
          Could not load all content from the CMS.
          <span className="block mt-1 text-amber-300/80 text-xs font-mono max-w-2xl mx-auto truncate" title={error}>
            {error}
          </span>
        </div>
      )}
      <DigitalExperienceBanner
        title={<>{bannerProps.title}</>}
        description={bannerProps.description || undefined}
        className={bannerStyles.tunedBanner}
        backgroundImage={
          resolvedBannerBg
            ? {
                src: resolvedBannerBg,
                alt: bannerProps.backgroundImage?.alt?.trim() || "Background",
              }
            : undefined
        }
        videoSrc={bannerProps.videoSrc}
        videoPosition="top-right"
      />
      <OurWorkProjectGrid ref={sectionRef} items={workItemsToShow} />
      {accordionProps?.items?.length ? (
        <Accordion title={accordionProps.title} items={accordionProps.items} />
      ) : null}
    </main>
    </>
  );
}
