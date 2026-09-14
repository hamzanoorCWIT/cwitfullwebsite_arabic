"use client";

import { useRef, useEffect, type CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { tooltipFromHtml } from "@/app/lib/tooltip-from-html";

export interface CarouselCard {
  type: "text" | "image";
  title: string;
  subtitle?: string;
  description?: string;
  marketInfo?: string; // For "Across UAE, UK & US markets" type info
  image?: string | StaticImageData;
  backgroundColor?: string;
  textColor?: string;
}

interface CarouselProps {
  cards: CarouselCard[];
  speed?: number; // Animation duration in seconds
  pauseOnHover?: boolean;
  className?: string;
  cardClassName?: string;
}

const BACKGROUND_COLOR_MAP: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  "bg-white": "#ffffff",
  "bg-black": "#000000",
  "bg-zinc-900": "#18181b",
  "bg-zinc-800": "#27272a",
  "bg-zinc-200": "#e4e4e7",
  "bg-zinc-100": "#f4f4f5",
  "bg-gray-200": "#e5e7eb",
  "bg-gray-100": "#f3f4f6",
};

const TEXT_COLOR_MAP: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  "text-white": "#ffffff",
  "text-black": "#000000",
  "text-zinc-900": "#18181b",
  "text-zinc-800": "#27272a",
  "text-gray-900": "#111827",
  "text-gray-800": "#1f2937",
};

function extractBracketValue(value: string, prefix: "bg" | "text"): string | undefined {
  const match = value.match(new RegExp(`^${prefix}-\\[(.+)\\]$`));
  return match?.[1]?.trim();
}

function resolveColorValue(raw: string | undefined, kind: "bg" | "text"): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  const fromBracket = extractBracketValue(value, kind);
  if (fromBracket) return fromBracket;

  if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
    return value;
  }

  const map = kind === "bg" ? BACKGROUND_COLOR_MAP : TEXT_COLOR_MAP;
  return map[value] || (/^[a-zA-Z]+$/.test(value) ? value : undefined);
}

function getTextStyles(color: string | undefined, dimmed: boolean = false): CSSProperties | undefined {
  if (!color) return undefined;
  return dimmed ? { color, opacity: 0.7 } : { color };
}

export default function Carousel({
  cards,
  speed = 60,
  pauseOnHover = true,
  className = "",
  cardClassName = "",
}: CarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const isSingleCard = cards.length === 1;

  useEffect(() => {
    if (!carouselTrackRef.current || !carouselRef.current) return;

    const track = carouselTrackRef.current;
    const carouselContainer = carouselRef.current;
    const cardElements = Array.from(track.children) as HTMLElement[];

    if (cardElements.length === 0) return;

    const cardWidth = cardElements[0]?.offsetWidth || 436;
    const gap = 24; // gap-6 = 24px

    const animation = isSingleCard
      ? gsap.fromTo(
          track,
          {
            x: carouselContainer.offsetWidth,
          },
          {
            x: -(cardWidth + gap),
            duration: speed,
            ease: "none",
            repeat: -1,
          }
        )
      : (() => {
          const firstSetCards = cardElements.slice(0, cards.length);
          const firstCardWidth = firstSetCards[0]?.offsetWidth || 436;
          const cardTotalWidth = firstCardWidth + gap;
          const setWidth = cardTotalWidth * cards.length;

          return gsap.to(track, {
            x: -setWidth * 2,
            duration: speed,
            ease: "none",
            repeat: -1,
            modifiers: {
              x: (x) => {
                const num = parseFloat(x);
                if (num <= -setWidth) {
                  return num + setWidth + "px";
                }
                return x;
              },
            },
          });
        })();

    // Pause carousel on hover
    let handleCarouselEnter: (() => void) | null = null;
    let handleCarouselLeave: (() => void) | null = null;

    if (pauseOnHover) {
      handleCarouselEnter = () => {
        if (animation) animation.pause();
      };

      handleCarouselLeave = () => {
        if (animation) animation.resume();
      };

      carouselContainer.addEventListener("mouseenter", handleCarouselEnter);
      carouselContainer.addEventListener("mouseleave", handleCarouselLeave);
    }

    // Add hover scale effect to all cards
    const handlers: Array<{ element: HTMLElement; enter: () => void; leave: () => void }> = [];

    cardElements.forEach((card) => {
      const cardElement = card as HTMLElement;

      const handleEnter = () => {
        gsap.to(cardElement, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const handleLeave = () => {
        gsap.to(cardElement, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      };

      cardElement.addEventListener("mouseenter", handleEnter);
      cardElement.addEventListener("mouseleave", handleLeave);

      handlers.push({ element: cardElement, enter: handleEnter, leave: handleLeave });
    });

    return () => {
      if (animation) animation.kill();
      if (pauseOnHover && handleCarouselEnter && handleCarouselLeave) {
        carouselContainer.removeEventListener("mouseenter", handleCarouselEnter);
        carouselContainer.removeEventListener("mouseleave", handleCarouselLeave);
      }
      handlers.forEach(({ element, enter, leave }) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
    };
  }, [cards, speed, pauseOnHover, isSingleCard]);

  const renderCard = (card: CarouselCard, index: number, keyPrefix: string) => {
    const bgColorValue = resolveColorValue(card.backgroundColor, "bg");
    const textColorValue = resolveColorValue(card.textColor, "text");

    if (card.type === "image" && card.image) {
      return (
        <div
          key={`${keyPrefix}-${index}`}
          className={`flex-shrink-0 rounded-[10px] cursor-pointer will-change-transform ${cardClassName}`}
        >
          <div
            className="relative h-[299px] md:h-[499px] w-[236px] md:w-[436px] flex flex-col justify-between border border-[#BFBFBF] rounded-[10px] overflow-hidden"
            style={bgColorValue ? { backgroundColor: bgColorValue } : undefined}
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-black/80" />
            {/* Top text section */}
            <div className="relative z-10 p-6 text-white">
              <h3
                className="text-[20px] md:text-[30px] font-bold text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] line-clamp-1 overflow-hidden"
                title={tooltipFromHtml(card.title)}
                style={getTextStyles(textColorValue)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.title) }}
              />
              {card.subtitle && (
                <p
                  className="text-[20px] md:text-[30px] text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] line-clamp-2 overflow-hidden"
                  title={tooltipFromHtml(card.subtitle)}
                  style={getTextStyles(textColorValue)}
                  dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.subtitle) }}
                />
              )}
            </div>
            {/* Bottom text section */}
            {card.description && (
              <div className="relative z-10 p-6 text-white">
                <p
                  className="text-[14px] md:text-[22px] text-white/70 leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] line-clamp-2 overflow-hidden"
                  title={tooltipFromHtml(card.description)}
                  style={getTextStyles(textColorValue, true)}
                  dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.description) }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    // Text card
    const bgColor = card.backgroundColor || "bg-zinc-900";
    const customTextColor = card.textColor;
    const isWhiteBg = bgColor === "bg-white" || bgColor === "white";
    const isLightBg = bgColor === "bg-zinc-200" || bgColor === "bg-gray-200" || bgColor === "bg-zinc-100" || bgColor === "bg-gray-100" || bgColor === "bg-[#E3E3E3]";
    const isDarkBg = bgColor === "bg-zinc-900" || bgColor === "bg-zinc-800" || bgColor === "bg-black";
    
    // Use custom textColor if provided, otherwise determine from background
    const titleColor = customTextColor || (isWhiteBg || isLightBg ? "text-black" : isDarkBg ? "text-white" : "text-white");
    const descColor = customTextColor ? (customTextColor === "text-black" ? "text-black/70" : "text-white/70") : (isWhiteBg || isLightBg ? "text-black/70" : isDarkBg ? "text-white/70" : "text-white/70");
    const textCardStyles = bgColorValue ? { backgroundColor: bgColorValue } : undefined;

    return (
      <div
        key={`${keyPrefix}-${index}`}
        className={`flex-shrink-0 rounded-[10px] cursor-pointer will-change-transform ${cardClassName}`}
      >
        <div
          className={`h-[221px] md:h-[321px] w-[236px] md:w-[436px] p-8 flex flex-col justify-between border border-[#BFBFBF] rounded-[10px] ${bgColorValue ? "" : bgColor}`}
          style={textCardStyles}
        >
          <div>
            <h3
              className={`text-[20px] md:text-[30px] font-bold mb-1 ${textColorValue ? "" : titleColor} leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] line-clamp-1 overflow-hidden`}
              title={tooltipFromHtml(card.title)}
              style={getTextStyles(textColorValue)}
              dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.title) }}
            />
            {card.subtitle && (
              <p
                className={`text-[20px] md:text-[30px] mb-2 ${textColorValue ? "" : titleColor} leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] line-clamp-1 overflow-hidden`}
                title={tooltipFromHtml(card.subtitle)}
                style={getTextStyles(textColorValue)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.subtitle) }}
              />
            )}
          </div>
          <div>
            {card.description && (
              <p
                className={`text-[16px] md:text-[22px] ${textColorValue ? "" : descColor} leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] line-clamp-2 overflow-hidden`}
                title={tooltipFromHtml(card.description)}
                style={getTextStyles(textColorValue, true)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.description) }}
              />
            )}
            {card.marketInfo && (
              <p
                className={`text-[16px] md:text-[22px] ${textColorValue ? "" : descColor} leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] line-clamp-2 overflow-hidden mt-2`}
                title={tooltipFromHtml(card.marketInfo)}
                style={getTextStyles(textColorValue, true)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.marketInfo) }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={carouselRef} className={`relative ${className}`}>
      <div
        ref={carouselTrackRef}
        className="flex gap-6 will-change-transform"
        style={{ width: "fit-content" }}
      >
        {/* First set of cards */}
        {cards.map((card, index) => renderCard(card, index, "first"))}
        {/* Duplicate set for seamless loop */}
        {!isSingleCard && cards.map((card, index) => renderCard(card, index, "second"))}
      </div>
    </div>
  );
}

