"use client";

import { lockPageScroll, unlockPageScroll } from "@/app/lib/scroll-lock";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import StudioServiceCards, {
  type StudioServiceCard,
} from "./StudioServiceCards";
import type { OfferModalContent } from "@/app/lib/home-offers-types";
import styles from "./FigmaHomeOfferModal.module.css";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { getHomeUiCopy } from "@/app/lib/home-ui-copy";

type FigmaHomeOfferModalProps = {
  content: OfferModalContent;
  onClose: () => void;
};

/** Ecommerce + SEO popups: image bottom-left, text on the right (physical). */
const IMAGE_BOTTOM_LEFT_TITLES = new Set(
  [
    "Ecommerce Solutions",
    "حلول التجارة الإلكترونية",
    "Search Engine Optimisation",
    "Search Engine Optimization",
    "SEO",
    "تحسين محركات البحث",
  ].map((title) => title.trim().toLowerCase())
);

function wantsImageBottomLeft(card: StudioServiceCard): boolean {
  return IMAGE_BOTTOM_LEFT_TITLES.has(card.title.trim().toLowerCase());
}

export default function FigmaHomeOfferModal({ content, onClose }: FigmaHomeOfferModalProps) {
  const { locale } = useLocalePreference();
  const copy = getHomeUiCopy(locale);
  const contentDir = locale === "ar" ? "rtl" : "ltr";

  const detailCards = useMemo(() => {
    return content.detailCards.map((card) => {
      if (!wantsImageBottomLeft(card)) return card;
      return {
        ...card,
        imagePosition: "left" as const,
        imageVAlign: "bottom" as const,
      };
    });
  }, [content.detailCards]);

  useEffect(() => {
    lockPageScroll("modal");

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      unlockPageScroll();

      requestAnimationFrame(() => {
        void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
          ScrollTrigger.refresh();
        });
      });
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const modalTitle =
    content.bannerTitle?.trim() || content.detailCards[0]?.title?.trim() || "";

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={modalTitle}
      dir={contentDir}
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label={copy.closeServiceDetails}>
        <span aria-hidden="true">&times;</span>
      </button>

      <div className={styles.scroll} data-lenis-prevent>
        <StudioServiceCards
          cards={detailCards}
          contentOverlapMaxWidth={1620}
          transparentBackground
          className={styles.cards}
          textDir={contentDir}
        />
      </div>
    </div>,
    document.body
  );
}
