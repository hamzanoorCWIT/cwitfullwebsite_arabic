"use client";

import { useRef, useEffect, useState, type CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { tooltipFromHtml } from "@/app/lib/tooltip-from-html";
import { horizontalOverflow, isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SliderCard {
  type: "text" | "image";
  title: string;
  subtitle?: string;
  description?: string;
  marketInfo?: string;
  image?: string | StaticImageData;
  backgroundColor?: string;
  textColor?: string;
}

interface HorizontalScrollSliderProps {
  cards: SliderCard[];
  className?: string;
  cardClassName?: string;
  trackClassName?: string;
  /** Dark gradient over image cards (home showcase). Off for portfolio details. */
  imageOverlay?: boolean;
  onCardClick?: (card: SliderCard, index: number) => void;
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

export default function HorizontalScrollSlider({
  cards,
  className = "",
  cardClassName = "",
  trackClassName = "",
  imageOverlay = false,
  onCardClick,
}: HorizontalScrollSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isSingleCard = cards.length === 1;
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Horizontal scroll animation on page scroll
  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;

    const container = containerRef.current;
    const slider = sliderRef.current;
    const firstCard = slider.children[0] as HTMLElement | undefined;
    const cardWidth = firstCard?.offsetWidth || 436;
    const isRtl = isRtlDirection(container);

    const scrollTween = isSingleCard
      ? gsap.fromTo(
          slider,
          { x: isRtl ? -container.offsetWidth : container.offsetWidth },
          {
            x: isRtl ? cardWidth + 40 : -(cardWidth + 40),
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "center center",
              end: () => `+=${container.offsetWidth + cardWidth + 80}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        )
      : (() => {
          const getScrollAmount = () =>
            rtlAwareTranslateX(horizontalOverflow(slider, container), isRtlDirection(container));

          return gsap.to(slider, {
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
        })();

    return () => {
      scrollTween.scrollTrigger?.kill(true);
      scrollTween.kill();
    };
  }, [cards, isSingleCard]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setDragStartPos({ x: e.pageX, y: e.pageY });

    // Get the current x position from GSAP
    const currentX = gsap.getProperty(sliderRef.current, "x") as number;
    setScrollLeft(currentX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();

    const dragDistance = Math.sqrt(
      Math.pow(e.pageX - dragStartPos.x, 2) + Math.pow(e.pageY - dragStartPos.y, 2)
    );
    
    // If moved more than 5px, consider it a drag
    if (dragDistance > 5) {
      hasDraggedRef.current = true;
    }

    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiply for faster drag
    const newX = scrollLeft + walk;

    const overflow = containerRef.current
      ? horizontalOverflow(sliderRef.current, containerRef.current)
      : 0;
    const isRtl = isRtlDirection(containerRef.current);
    const clampedX = isRtl
      ? Math.min(overflow, Math.max(0, newX))
      : Math.max(-overflow, Math.min(0, newX));

    gsap.to(sliderRef.current, {
      x: clampedX,
      duration: 0,
    });
  };

  const handleMouseUp = () => {
    const wasDragging = hasDraggedRef.current;
    setIsDragging(false);
    // Reset after a short delay to allow click handler to check
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
    return wasDragging;
  };

  // Handle card click
  const handleCardClick = (e: React.MouseEvent, index: number) => {
    // Only trigger if it wasn't a drag
    if (!hasDraggedRef.current && onCardClick) {
      e.stopPropagation();
      e.preventDefault();
      onCardClick(cards[index], index);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setDragStartPos({ x: e.touches[0].pageX, y: e.touches[0].pageY });

    const currentX = gsap.getProperty(sliderRef.current, "x") as number;
    setScrollLeft(currentX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const dragDistance = Math.sqrt(
      Math.pow(e.touches[0].pageX - dragStartPos.x, 2) + 
      Math.pow(e.touches[0].pageY - dragStartPos.y, 2)
    );
    
    // If moved more than 5px, consider it a drag
    if (dragDistance > 5) {
      hasDraggedRef.current = true;
    }

    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    const newX = scrollLeft + walk;

    const overflow = containerRef.current
      ? horizontalOverflow(sliderRef.current, containerRef.current)
      : 0;
    const isRtl = isRtlDirection(containerRef.current);
    const clampedX = isRtl
      ? Math.min(overflow, Math.max(0, newX))
      : Math.max(-overflow, Math.min(0, newX));

    gsap.to(sliderRef.current, {
      x: clampedX,
      duration: 0,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Reset after a short delay to allow tap handler to check
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  // Handle card tap
  const handleCardTap = (e: React.TouchEvent, index: number) => {
    // Only trigger if it wasn't a drag
    if (!hasDraggedRef.current && onCardClick) {
      e.stopPropagation();
      e.preventDefault();
      onCardClick(cards[index], index);
    }
  };

  const renderCard = (card: SliderCard, index: number) => {
    const bgColorValue = resolveColorValue(card.backgroundColor, "bg");
    const textColorValue = resolveColorValue(card.textColor, "text");

    if (card.type === "image" && card.image) {
      return (
        <div
          key={index}
          data-card-index={index}
          data-card-type={card.type}
          onClick={(e) => handleCardClick(e, index)}
          onTouchEnd={(e) => handleCardTap(e, index)}
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
            {imageOverlay ? (
              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                aria-hidden
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.18) 58%, rgba(0,0,0,0.78) 100%)",
                }}
              />
            ) : null}
            {/* Top text section */}
            <div className="relative z-10 p-6 text-white">
              <h3
                className={`text-[20px] md:text-[30px] font-bold text-white line-clamp-1 overflow-hidden${imageOverlay ? " drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]" : ""}`}
                title={tooltipFromHtml(card.title)}
                style={getTextStyles(textColorValue)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.title) }}
              />
              {card.subtitle && (
                <p
                  className={`text-[20px] md:text-[30px] text-white line-clamp-2 overflow-hidden${imageOverlay ? " drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]" : ""}`}
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
                  className={`text-[14px] md:text-[22px] ${imageOverlay ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]" : "text-white/70"} line-clamp-2 overflow-hidden`}
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
    const bgColor = card.backgroundColor?.trim() || "";
    const customTextColor = card.textColor;
    const isWhiteBg = bgColor === "bg-white" || bgColor === "white";
    const isLightBg = bgColor === "bg-zinc-200" || bgColor === "bg-gray-200" || bgColor === "bg-zinc-100" || bgColor === "bg-gray-100" || bgColor === "bg-[#E3E3E3]";
    const isDarkBg = bgColor === "bg-zinc-900" || bgColor === "bg-zinc-800" || bgColor === "bg-black";

    const titleColor = customTextColor || (isWhiteBg || isLightBg ? "text-black" : isDarkBg ? "text-white" : "text-white");
    const descColor = customTextColor ? (customTextColor === "text-black" ? "text-black/70" : "text-white/70") : (isWhiteBg || isLightBg ? "text-black/70" : isDarkBg ? "text-white/70" : "text-white/70");
    const textCardStyles = bgColorValue ? { backgroundColor: bgColorValue } : undefined;

    return (
      <div
        key={index}
        data-card-index={index}
        data-card-type={card.type}
        onClick={(e) => handleCardClick(e, index)}
        onTouchEnd={(e) => handleCardTap(e, index)}
        className={`flex-shrink-0 rounded-[10px] cursor-pointer will-change-transform ${cardClassName}`}
      >
        <div
          className={`h-[221px] md:h-[321px] w-[236px] md:w-[436px] p-8 flex flex-col justify-between border border-[#BFBFBF] rounded-[10px] ${bgColorValue ? "" : bgColor}`}
          style={textCardStyles}
        >
          <div>
            <h3
              className={`text-[20px] md:text-[30px] font-bold mb-1 ${textColorValue ? "" : titleColor} line-clamp-1 overflow-hidden`}
              title={tooltipFromHtml(card.title)}
              style={getTextStyles(textColorValue)}
              dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.title) }}
            />
            {card.subtitle && (
              <p
                className={`text-[20px] md:text-[30px] mb-2 ${textColorValue ? "" : titleColor} line-clamp-2 overflow-hidden`}
                title={tooltipFromHtml(card.subtitle)}
                style={getTextStyles(textColorValue)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.subtitle) }}
              />
            )}
          </div>
          <div>
            {card.description && (
              <p
                className={`text-[16px] md:text-[22px] ${textColorValue ? "" : descColor} line-clamp-2 overflow-hidden`}
                title={tooltipFromHtml(card.description)}
                style={getTextStyles(textColorValue, true)}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(card.description) }}
              />
            )}
            {card.marketInfo && (
              <p
                className={`text-[16px] md:text-[22px] ${textColorValue ? "" : descColor} line-clamp-2 overflow-hidden mt-2`}
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
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={sliderRef}
        className={`flex gap-6 px-4 md:px-10 will-change-transform ${trackClassName} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ width: "fit-content" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card, index) => renderCard(card, index))}
      </div>
    </div>
  );
}
