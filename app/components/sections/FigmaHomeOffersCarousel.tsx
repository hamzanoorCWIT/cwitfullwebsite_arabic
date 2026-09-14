"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FigmaHomeOfferModal from "./FigmaHomeOfferModal";
import { getOfferModalContent } from "./figma-home-offers-data";
import type { HomeOfferCard } from "@/app/lib/home-offers-types";
import { horizontalOverflow, isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { getHomeUiCopy } from "@/app/lib/home-ui-copy";
import { localizeHomeOfferCard } from "@/app/lib/home-offers-copy";
import styles from "./FigmaHomeOffers.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type OfferCard = HomeOfferCard;

type FigmaHomeOffersCarouselProps = {
  columns: OfferCard[][];
};

export default function FigmaHomeOffersCarousel({ columns }: FigmaHomeOffersCarouselProps) {
  const { locale } = useLocalePreference();
  const copy = getHomeUiCopy(locale);
  const localizedColumns = useMemo(
    () => columns.map((column) => column.map((card) => localizeHomeOfferCard(locale, card))),
    [columns, locale]
  );
  const [selectedCard, setSelectedCard] = useState<OfferCard | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !trackRef.current) return;

    const container = containerRef.current;
    const track = trackRef.current;

    gsap.set(track, { x: 0 });

    const getScrollAmount = () =>
      rtlAwareTranslateX(horizontalOverflow(track, container), isRtlDirection(container));

    const initialScrollAmount = getScrollAmount();
    if (initialScrollAmount === 0) return;

    const scrollTween = gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "center center",
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      scrollTween.scrollTrigger?.kill(true);
      scrollTween.kill();
    };
  }, [localizedColumns]);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>, card: OfferCard) => {
    if (!card.modalContent) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedCard(card);
    }
  };

  const selectedModalContent = selectedCard ? getOfferModalContent(selectedCard) : null;

  return (
    <>
      <div ref={containerRef} className={styles.offerScroller} aria-label={copy.services}>
        <div ref={trackRef} className={styles.offerTrack}>
          {localizedColumns.map((column, columnIndex) => (
            <div key={columnIndex} className={styles.offerColumn}>
              {column.map((card, cardIndex) => (
                <article
                  key={`${card.kind}-${card.title}-${cardIndex}`}
                  className={`${styles.offerCard} ${card.mini ? styles.offerCardMini : ""}`}
                  data-kind={card.kind}
                  role={card.modalContent ? "button" : undefined}
                  tabIndex={card.modalContent ? 0 : undefined}
                  aria-label={
                    card.modalContent
                      ? copy.viewDetailsFor(card.title)
                      : undefined
                  }
                  onClick={
                    card.modalContent ? () => setSelectedCard(card) : undefined
                  }
                  onKeyDown={(event) => handleCardKeyDown(event, card)}
                >
                  {card.background ? (
                    card.kind === "chatbots" ? (
                      <div className={styles.offerCardSurface}>
                        <img className={styles.offerBg} src={card.background} alt="" draggable={false} />
                      </div>
                    ) : (
                      <img className={styles.offerBg} src={card.background} alt="" draggable={false} />
                    )
                  ) : null}
                  {card.art ? (
                    card.kind === "chatbots" ? (
                      <div className={styles.offerArtWrap}>
                        <img className={styles.offerArt} src={card.art} alt="" draggable={false} />
                      </div>
                    ) : (
                      <img className={styles.offerArt} src={card.art} alt="" draggable={false} />
                    )
                  ) : null}
                  <div className={styles.offerContent}>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                  {card.modalContent ? (
                    <span className={styles.offerExpand} aria-hidden="true">
                      <Image
                        src="/imgs/full-screen.png"
                        alt=""
                        width={32}
                        height={32}
                        className={styles.offerExpandIcon}
                        unoptimized
                        draggable={false}
                      />
                    </span>
                  ) : null}
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedModalContent ? (
        <FigmaHomeOfferModal content={selectedModalContent} onClose={() => setSelectedCard(null)} />
      ) : null}
    </>
  );
}
