"use client";

import Image, { StaticImageData } from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const toCssLength = (v: number | string | undefined) =>
  typeof v === "number" ? `${v}px` : v;

export interface StudioServiceCard {
  /** Small uppercase eyebrow, e.g. "YEAR 2024". */
  yearLabel?: string;
  title: string;
  description?: string;
  /** Small uppercase label above the value, e.g. "INDUSTRY". */
  industryLabel?: string;
  /** Value shown under the industry label, e.g. "Education". */
  industryValue?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string | StaticImageData;
  imageAlt?: string;
  /** Explicit overlay image size; when set, the image is anchored bottom-right. */
  imageWidth?: number | string;
  imageHeight?: number | string;
  /** Vertical anchor for the sized overlay image. Defaults to "bottom". */
  imageVAlign?: "bottom" | "center";
  /** How the overlay image fills its box. Defaults to "contain". */
  imageFit?: "cover" | "contain";
  /** Extra classes appended to the image wrapper for fine-tuning (e.g. offsets). */
  imageClassName?: string;
  /** Vertical alignment of the text content. Defaults to "center". */
  contentVAlign?: "center" | "top";
  /** Max width of the text content block. */
  contentMaxWidth?: number | string;
  /** CSS `background` value for the card (gradient or solid). */
  gradient?: string;
  /** Optional border color for the card. */
  borderColor?: string;
  /** Full-cover background image for the card (sits behind the content). */
  backgroundImage?: string | StaticImageData;
  /** Optional second overlay image anchored to the top-left of the card. */
  overlayImage?: string | StaticImageData;
  overlayImageWidth?: number | string;
  overlayImageHeight?: number | string;
  /** Which side the image sits on. Defaults to "right". */
  imagePosition?: "left" | "right";
}

interface StudioServiceCardsProps {
  cards: StudioServiceCard[];
  className?: string;
  /** From lg (1024px) up to this width (px), text overlaps the card image. */
  contentOverlapMaxWidth?: number;
  /** When true, section uses a transparent background (e.g. home offer modal). */
  transparentBackground?: boolean;
  /** Pull section up over the page banner (desktop), like our-work / services listing. */
  overlapBanner?: boolean;
  /** Text direction for titles/descriptions. Layout left/right stays physical. */
  textDir?: "ltr" | "rtl";
}

export default function StudioServiceCards({
  cards,
  className = "",
  contentOverlapMaxWidth,
  transparentBackground = false,
  overlapBanner = false,
  textDir,
}: StudioServiceCardsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  useGSAP(
    () => {
      if (transparentBackground || !sectionRef.current) return;
      const items = sectionRef.current.querySelectorAll(".studio-service-card");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    sectionRef,
    [cards, transparentBackground]
  );

  if (!cards?.length) return null;

  return (
    <section
      ref={sectionRef}
      className={
        overlapBanner
          ? `relative z-[25] overflow-visible bg-transparent py-12 md:-mt-[270px] md:py-16 lg:-mt-[300px] lg:py-20 xl:-mt-[354px] ${className}`
          : `relative overflow-hidden py-12 md:py-16 lg:py-20 ${
              transparentBackground ? "bg-transparent" : "bg-black"
            } ${className}`
      }
    >
      <div className="mx-auto flex w-full max-w-[1761px] flex-col gap-6 md:gap-12 px-6 sm:px-8 md:px-10 lg:px-12">
        {cards.map((card, i) => {
          const imageLeft = card.imagePosition === "left";
          const overlap = Boolean(contentOverlapMaxWidth);
          const contentOverlapClass = overlap
            ? imageLeft
              ? "lg:max-[1619px]:!absolute lg:max-[1619px]:!inset-y-0 lg:max-[1619px]:!right-6 lg:max-[1619px]:!left-auto lg:max-[1619px]:!z-[4] lg:max-[1619px]:!flex lg:max-[1619px]:!w-[52%] lg:max-[1619px]:!max-w-[52%] lg:max-[1619px]:!flex-none lg:max-[1619px]:!justify-center lg:max-[1619px]:!items-start lg:max-[1619px]:!text-start min-[1620px]:!relative min-[1620px]:!flex-1 min-[1620px]:!w-auto min-[1620px]:!max-w-none min-[1620px]:!items-stretch"
              : "lg:max-[1619px]:!absolute lg:max-[1619px]:!inset-y-0 lg:max-[1619px]:!left-6 lg:max-[1619px]:!right-auto lg:max-[1619px]:!z-[4] lg:max-[1619px]:!flex lg:max-[1619px]:!w-[52%] lg:max-[1619px]:!max-w-[52%] lg:max-[1619px]:!flex-none lg:max-[1619px]:!justify-center lg:max-[1619px]:!items-start lg:max-[1619px]:!text-start min-[1620px]:!relative min-[1620px]:!flex-1 min-[1620px]:!w-auto min-[1620px]:!max-w-none"
            : "";
          const imageOverlapWrapperClass = overlap
            ? imageLeft
              ? "lg:max-[1619px]:!absolute lg:max-[1619px]:!inset-y-0 lg:max-[1619px]:!left-0 lg:max-[1619px]:!right-auto lg:max-[1619px]:!w-[58%] lg:max-[1619px]:!h-full lg:max-[1619px]:!flex-none lg:max-[1619px]:!z-[1] min-[1620px]:!relative min-[1620px]:!flex-1 min-[1620px]:!w-auto min-[1620px]:!h-auto"
              : "lg:max-[1619px]:!absolute lg:max-[1619px]:!inset-y-0 lg:max-[1619px]:!right-0 lg:max-[1619px]:!left-auto lg:max-[1619px]:!w-[58%] lg:max-[1619px]:!h-full lg:max-[1619px]:!flex-none lg:max-[1619px]:!z-[1] min-[1620px]:!relative min-[1620px]:!flex-1 min-[1620px]:!w-auto min-[1620px]:!h-auto"
            : "";
          const imageOverlapBoxClass = overlap
            ? "lg:max-[1619px]:!w-full lg:max-[1619px]:!h-[90%] lg:max-[1619px]:!max-w-full"
            : "";
          return (
            <div
              key={i}
              className="studio-service-card group relative overflow-hidden rounded-[20px] lg:h-[750px]"
              style={{
                background: card.gradient,
                ...(card.borderColor ? { border: `1px solid ${card.borderColor}` } : {}),
              }}
            >
              {card.backgroundImage ? (
                <Image
                  src={card.backgroundImage}
                  alt=""
                  fill
                  className="object-cover z-0"
                  sizes="100vw"
                  unoptimized={typeof card.backgroundImage === "string"}
                />
              ) : null}
              {card.overlayImage ? (
                <div
                  className="pointer-events-none absolute left-0 top-0 z-[2] max-lg:!inset-0 max-lg:!h-full max-lg:!w-full"
                  style={{
                    width: toCssLength(card.overlayImageWidth) ?? "100%",
                    height: toCssLength(card.overlayImageHeight) ?? "100%",
                  }}
                >
                  <Image
                    src={card.overlayImage}
                    alt=""
                    fill
                    className="object-contain object-left-top max-lg:!object-cover max-lg:!object-center"
                    sizes="100vw"
                    unoptimized={typeof card.overlayImage === "string"}
                  />
                </div>
              ) : null}
              <div
                dir="ltr"
                className={`relative flex h-full flex-col ${
                  imageLeft ? "lg:flex-row-reverse" : "lg:flex-row"
                } ${overlap ? "lg:max-[1619px]:block lg:max-[1619px]:min-h-full min-[1620px]:flex" : ""}`}
              >
                {/* Content */}
                <div
                  dir={textDir}
                  className={`relative z-[3] flex flex-1 flex-col p-8 md:p-12 lg:p-16 max-lg:justify-start ${
                    card.contentVAlign === "top" ? "justify-start" : "justify-center"
                  } ${contentOverlapClass}`}
                >
                  <div
                    className={`flex flex-col ${overlap ? "lg:max-[1619px]:!max-w-full" : ""}`}
                    style={
                      card.contentMaxWidth
                        ? { maxWidth: toCssLength(card.contentMaxWidth) }
                        : undefined
                    }
                  >
                    {card.yearLabel ? (
                      <span className="text-start text-[13px] lg:text-[16px] font-[500] uppercase leading-[1.8] lg:leading-[30px] tracking-[3px] lg:tracking-[4.64px] text-white">
                        {card.yearLabel}
                      </span>
                    ) : null}
                    <h3 className="mt-2 text-start text-[28px] leading-[1] sm:text-[34px] md:text-[40px] lg:text-[46px] lg:leading-[60px] font-[400] tracking-normal text-white">
                      {card.title}
                    </h3>
                    {card.description ? (
                      <p className="mt-2 text-start text-[15px] sm:text-[16px] lg:text-[20px] font-[500] leading-[1.6] lg:leading-[30px] text-white/80">
                        {card.description}
                      </p>
                    ) : null}
                    {card.industryValue ? (
                      <div className="mt-8 lg:mt-12 flex flex-col">
                        {card.industryLabel ? (
                          <span className="text-[13px] lg:text-[16px] font-[500] uppercase leading-[1.8] lg:leading-[30px] tracking-[3px] lg:tracking-[4.64px] text-white">
                            {card.industryLabel}
                          </span>
                        ) : null}
                        <span className="mt-2 text-[28px] leading-[1.25] sm:text-[34px] md:text-[40px] lg:text-[46px] lg:leading-[75px] font-[400] text-white">
                          {card.industryValue}
                        </span>
                      </div>
                    ) : null}
                    {card.ctaText ? (
                      <button
                        type="button"
                        onClick={() => card.ctaLink && router.push(card.ctaLink)}
                        className="mt-8 lg:mt-12 inline-flex w-fit cursor-pointer items-center justify-center gap-[10px] rounded-[50px] bg-white px-8 py-3.5 lg:px-[50px] lg:py-5 text-[13px] lg:text-[14px] font-[500] uppercase tracking-wide text-[#1a1a1a] transition-colors hover:bg-white/90"
                      >
                        {card.ctaText}
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Image */}
                {card.image ? (
                  card.imageWidth || card.imageHeight ? (
                    <div
                      className={`relative z-[1] flex min-w-0 flex-1 ${
                        card.imageVAlign === "center" ? "items-center" : "items-end"
                      } ${imageLeft ? "justify-start" : "justify-end"} ${imageOverlapWrapperClass} ${card.imageClassName ?? ""}`}
                    >
                      <div
                        className={`relative shrink-0 max-lg:!h-[300px] max-lg:!w-full sm:max-lg:!h-[380px] ${imageOverlapBoxClass}`}
                        style={{
                          width: toCssLength(card.imageWidth) ?? "100%",
                          height: toCssLength(card.imageHeight) ?? "100%",
                        }}
                      >
                        <Image
                          src={card.image}
                          alt={card.imageAlt || card.title}
                          fill
                          className={`${card.imageFit === "cover" ? "object-cover" : "object-contain"} ${
                            card.imageVAlign === "center"
                              ? imageLeft
                                ? "object-left"
                                : "object-right"
                              : imageLeft
                              ? "object-left-bottom"
                              : "object-right-bottom"
                          }`}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          unoptimized={typeof card.image === "string"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={`relative z-[1] h-[280px] min-h-[280px] min-w-0 flex-1 sm:h-[360px] lg:h-auto ${card.imageClassName ?? ""}`}>
                      <Image
                        src={card.image}
                        alt={card.imageAlt || card.title}
                        fill
                        className="object-contain object-center p-6 lg:p-10"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized={typeof card.image === "string"}
                      />
                    </div>
                  )
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
