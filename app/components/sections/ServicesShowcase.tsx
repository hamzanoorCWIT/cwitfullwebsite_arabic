"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ShowcaseCard {
  title: string;
  description?: string;
  /** Max width of the description (e.g. 192 or "192px"). Defaults to 292.39px. */
  descriptionMaxWidth?: number | string;
  /** Optional image rendered as an overlay over the background. */
  image?: string | StaticImageData;
  imageAlt?: string;
  /** Height of the overlay image (e.g. 417 or "417px"). Defaults to full card. */
  imageHeight?: number | string;
  /** Width of the overlay image (e.g. 319.07). Defaults to full card width. */
  imageWidth?: number | string;
  /** Explicit offsets for the overlay image box (number = px). Override imagePosition. */
  imageTop?: number | string;
  imageLeft?: number | string;
  imageRight?: number | string;
  imageBottom?: number | string;
  /** Where the overlay image sits within the card. Defaults to "bottom". */
  imagePosition?: "bottom" | "center" | "left" | "top-left" | "top" | "bottom-right" | "bottom-left";
  /** How the overlay image fills its box. Defaults to "cover". */
  imageFit?: "cover" | "contain";
  /** Extra classes appended to the overlay image wrapper for fine-tuning (e.g. offsets). */
  imageClassName?: string;
  /** Allow the overlay image to bleed outside the card (disables the card clip). */
  imageOverflow?: boolean;
  /** Where the title/description block sits. Defaults to "top-left". */
  contentPosition?: "top-left" | "center-right" | "bottom-left" | "top-center";
  /** Extra classes appended to the title/description wrapper for fine-tuning. */
  contentClassName?: string;
  /** CSS `background` value for the card (gradient or solid). */
  gradient?: string;
  /** Optional border color for the card. */
  borderColor?: string;
  /** Optional CSS box-shadow for the card. */
  boxShadow?: string;
  /** Full-cover background image for the card (sits behind the overlay image). */
  backgroundImage?: string | StaticImageData;
  /** Optional link; when set the whole card is clickable. */
  href?: string;
  /** Spans two rows in the desktop bento layout (the tall side cards). */
  tall?: boolean;
}

interface ServicesShowcaseProps {
  title?: ReactNode;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  cards: ShowcaseCard[];
  className?: string;
  /** Pull section up over the page banner (desktop), like our-work listing. */
  overlapBanner?: boolean;
  /** Font utility for section headings, descriptions, and card text (e.g. "font-inter"). */
  fontClassName?: string;
  /** Font utility for the CTA button text (e.g. "font-gilroy"). */
  ctaFontClassName?: string;
}

const toCssLength = (v: number | string | undefined) =>
  typeof v === "number" ? `${v}px` : v;

const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #6D3B8F 0%, #3A1D5C 100%)",
  "linear-gradient(135deg, #4F46E5 0%, #2E2A8F 100%)",
  "linear-gradient(135deg, #D6207E 0%, #7A1247 100%)",
  "linear-gradient(135deg, #2A2D3A 0%, #15171F 100%)",
];

const IMAGE_BOX_POSITION: Record<NonNullable<ShowcaseCard["imagePosition"]>, string> = {
  bottom: "left-1/2 bottom-0 -translate-x-1/2",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  left: "left-0 top-1/2 -translate-y-1/2",
  "top-left": "left-0 top-0",
  top: "left-1/2 top-0 -translate-x-1/2",
  "bottom-right": "right-0 bottom-0",
  "bottom-left": "left-0 bottom-0",
};

const IMAGE_OBJECT_POSITION: Record<NonNullable<ShowcaseCard["imagePosition"]>, string> = {
  bottom: "object-bottom",
  center: "object-center",
  left: "object-left",
  "top-left": "object-left-top",
  top: "object-top",
  "bottom-right": "object-right-bottom",
  "bottom-left": "object-left-bottom",
};

function ExpandArrow() {
  return (
    <span className="flex h-9 w-9 items-center justify-center transition-transform duration-300 group-hover:scale-110">
      <Image
        src="/imgs/full-screen.png"
        alt=""
        width={32}
        height={32}
        className="h-9 w-9 object-contain"
        unoptimized
      />
    </span>
  );
}

function ShowcaseCardItem({
  card,
  index,
  fontClassName = "",
}: {
  card: ShowcaseCard;
  index: number;
  fontClassName?: string;
}) {
  const background = card.backgroundImage
    ? "transparent"
    : card.gradient || DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];

  const inner = (
    <>
      {card.backgroundImage ? (
        <Image
          src={card.backgroundImage}
          alt=""
          fill
          className="object-cover z-0 rounded-[20px]"
          sizes="(max-width: 1024px) 100vw, 566px"
          unoptimized={typeof card.backgroundImage === "string"}
        />
      ) : null}
      {card.image ? (
        <div
          className={`absolute z-0 ${IMAGE_BOX_POSITION[card.imagePosition ?? "bottom"]} max-lg:!inset-x-0 max-lg:!bottom-0 max-lg:!top-auto max-lg:!h-[55%] max-lg:!w-full max-lg:!translate-x-0 max-lg:!translate-y-0 ${card.imageClassName ?? ""}`}
          style={{
            ...(card.imageClassName
              ? {}
              : {
                  height: card.imageHeight !== undefined ? toCssLength(card.imageHeight) : "100%",
                  width: card.imageWidth !== undefined ? toCssLength(card.imageWidth) : "100%",
                }),
            ...(card.imageTop !== undefined ? { top: toCssLength(card.imageTop) } : {}),
            ...(card.imageLeft !== undefined ? { left: toCssLength(card.imageLeft) } : {}),
            ...(card.imageRight !== undefined ? { right: toCssLength(card.imageRight) } : {}),
            ...(card.imageBottom !== undefined ? { bottom: toCssLength(card.imageBottom) } : {}),
          }}
        >
          <Image
            src={card.image}
            alt={card.imageAlt || card.title}
            fill
            className={`${card.imageFit === "contain" ? "object-contain" : "object-cover"} ${
              IMAGE_OBJECT_POSITION[card.imagePosition ?? "bottom"]
            }`}
            sizes="(max-width: 1024px) 100vw, 626px"
            unoptimized={typeof card.image === "string"}
          />
        </div>
      ) : null}

      <div className="relative z-10 h-full p-6 lg:p-8">
        <div
          className={`max-lg:!static max-lg:!inset-auto max-lg:!w-full max-lg:!max-w-full max-lg:!items-start max-lg:!justify-start max-lg:!text-left max-lg:!translate-x-0 ${
            card.contentPosition === "center-right"
              ? "absolute inset-y-0 right-6 lg:right-8 flex w-1/2 flex-col items-start justify-center text-left"
              : card.contentPosition === "bottom-left"
              ? "absolute bottom-6 left-6 right-6 lg:bottom-8 lg:left-8 lg:right-8 flex max-w-[420px] flex-col"
              : card.contentPosition === "top-center"
              ? "absolute top-6 left-6 right-6 lg:top-8 lg:left-8 lg:right-8 flex flex-col items-center text-center"
              : "flex max-w-[420px] flex-col"
          } ${card.contentClassName ?? ""}`}
        >
          <h3 className={`text-[20px] sm:text-[22px] lg:text-[24px] font-[600] leading-[1.2] text-white ${fontClassName}`}>
            {card.title}
          </h3>
          {card.description ? (
            <p
              className={`mt-2 text-[13px] sm:text-[14px] lg:text-[15px] font-light leading-[1.5] text-white/75 ${fontClassName}`}
              style={{
                maxWidth:
                  typeof card.descriptionMaxWidth === "number"
                    ? `${card.descriptionMaxWidth}px`
                    : card.descriptionMaxWidth ?? "292.39px",
              }}
            >
              {card.description}
            </p>
          ) : null}
        </div>
        <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8">
          <ExpandArrow />
        </div>
      </div>
    </>
  );

  const cardClass = `showcase-card group relative rounded-[20px] ${
    card.imageOverflow || card.boxShadow ? "" : "overflow-hidden"
  } min-h-[415px] lg:min-h-0 ${card.tall ? "lg:row-span-2" : ""} ${
    card.href ? "cursor-pointer" : ""
  }`;

  const cardStyle = {
    background,
    ...(card.borderColor ? { border: `1px solid ${card.borderColor}` } : {}),
    ...(card.boxShadow ? { boxShadow: card.boxShadow } : {}),
  };

  if (card.href) {
    return (
      <Link href={card.href} className={cardClass} style={cardStyle}>
        {inner}
      </Link>
    );
  }

  return (
    <div className={cardClass} style={cardStyle}>
      {inner}
    </div>
  );
}

export default function ServicesShowcase({
  title,
  description,
  ctaText,
  ctaLink,
  cards,
  className = "",
  overlapBanner = false,
  fontClassName = "",
  ctaFontClassName = "",
}: ServicesShowcaseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const header = sectionRef.current.querySelector(".showcase-header");
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const items = sectionRef.current.querySelectorAll(".showcase-card");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    sectionRef,
    [cards]
  );

  if (!cards?.length) return null;

  return (
    <section
      ref={sectionRef}
      className={
        overlapBanner
          ? `relative z-[25] overflow-visible bg-transparent py-12 md:-mt-[270px] md:py-16 lg:-mt-[300px] lg:py-20 xl:-mt-[354px] ${className}`
          : `relative isolate overflow-hidden bg-black py-12 md:py-16 lg:py-20 ${className}`
      }
    >
      <div className="mx-auto w-full max-w-[1761px] px-6 sm:px-8 md:px-10 lg:px-8">
        {/* Header and grid fill the same width so their left/right edges align
            (CTA lines up with the right edge of the cards). */}
        <div className="w-full">
          {/* Header */}
          {(title || description || (ctaText && ctaLink)) && (
            <div className="showcase-header mb-10 flex flex-col gap-6 md:mb-38 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[820px]">
                {title ? (
                  <h2 className={`${SECTION_HEADING_CLASS} text-white ${fontClassName}`}>
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p className={`mt-4 text-[14px] sm:text-[16px] lg:text-[18px] font-light leading-[1.6] text-white ${fontClassName}`}>
                    {description}
                  </p>
                ) : null}
              </div>
              {ctaText && ctaLink ? (
                <div className="shrink-0">
                  <CallToActionButton
                    variant="shiny"
                    className={ctaFontClassName}
                    onClick={() => router.push(ctaLink)}
                  >
                    {ctaText}
                  </CallToActionButton>
                </div>
              ) : null}
            </div>
          )}

          {/* Bento grid: 3 equal columns fill the container width (≈565.67px each
              at the 1761 design width). Middle column holds two stacked cards; rows
              are 272px + 20px (gap-5) → a row-span-2 card is exactly 564px. */}
          <div className="grid grid-cols-1 gap-4 md:gap-5 w-full lg:grid-flow-col lg:grid-cols-3 lg:grid-rows-[272px_272px]">
            {cards.map((card, index) => (
              <ShowcaseCardItem key={index} card={card} index={index} fontClassName={fontClassName} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
