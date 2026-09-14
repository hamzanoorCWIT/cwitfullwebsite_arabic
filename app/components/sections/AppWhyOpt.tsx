"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "../ui/CallToActionButton";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ServiceCard {
  title: string;
  description: string;
  textColor?: string;
  bgColor?: string;
}

interface AppWhyOptProps {
  videoSrc?: string;
  videoTopOffset?: string;
  videoPosition?: "left" | "right";
  videoRightOffset?: string;
  videoMaxWidth?: string;
  title: string | ReactNode;
  paragraphs?: (string | ReactNode)[];
  services?: ServiceCard[];
  buttonText?: string;
  icon?: StaticImageData | string;
  iconAlt?: string;
  backgroundImage?: StaticImageData | string;
  backgroundImageAlt?: string;
  backgroundImageClassName?: string;
  backgroundOverlay?: boolean;
  backgroundOverlayClassName?: string;
  className?: string;
  contentMaxWidth?: string;
}

export default function AppWhyOpt({
  videoSrc: customVideoSrc,
  videoTopOffset,
  videoPosition = "right",
  videoRightOffset,
  videoMaxWidth = "max-w-[900px]",
  title,
  paragraphs,
  services,
  buttonText,
  icon,
  iconAlt = "icon",
  backgroundImage,
  backgroundImageAlt = "Background",
  backgroundImageClassName = "",
  backgroundOverlay = false,
  backgroundOverlayClassName = "",
  className = "",
  contentMaxWidth = "container",
}: AppWhyOptProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const finalVideoSrc = customVideoSrc;

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate heading
      if (headingRef.current) {
        gsap.set(headingRef.current, {
          y: 50,
          opacity: 0,
        });
        tl.to(headingRef.current, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Animate paragraphs
      if (paragraphsRef.current) {
        const paragraphElements = paragraphsRef.current.children;
        gsap.set(paragraphElements, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          paragraphElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.15,
          },
          "-=0.5"
        );
      }

      // Animate cards
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.set(cards, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          cards,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
          },
          "-=0.4"
        );
      }

      // Animate button
      if (buttonRef.current) {
        gsap.set(buttonRef.current, {
          y: 20,
          opacity: 0,
        });
        tl.to(
          buttonRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.3"
        );
      }
    },
    sectionRef,
    []
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black py-20 md:py-42 overflow-hidden ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 industries-section-content-container">
      {/* Video - Behind everything */}
      {finalVideoSrc && (
        <div
          ref={videoContainerRef}
          className={`absolute ${videoTopOffset || ""} ${videoPosition === "left" ? `left-0 ${videoRightOffset || "pl-4 sm:pl-6 md:pl-8 lg:pl-12"}` : `${videoRightOffset || "right-0 pr-4 sm:pr-6 md:pr-8 lg:pr-12"}`} inset-0 z-10 flex items-center ${videoPosition === "left" ? "justify-start" : "justify-end"}`}
        >
          <div className={`relative w-full ${videoMaxWidth === "max-w-[900px]" ? "max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[650px] xl:max-w-[750px] 2xl:max-w-[900px]" : videoMaxWidth} h-[250px] xs:h-[300px] sm:h-[350px] md:h-[450px] lg:h-[550px] xl:h-[600px] 2xl:h-[650px]`}>
            <video
              ref={videoRef}
              src={finalVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      <div className={`relative z-20 ${contentMaxWidth} mx-auto app-why-opt-content-container ${videoPosition === "left" && "md:ps-0"}`}>
        {icon && (
          <Image
            src={icon}
            alt={iconAlt}
            width={100}
            height={100}
            className="w-auto h-auto"
          />
        )}
        <div className={`${videoPosition === "left" && "md:ps-72"}`}>
        {/* Heading */}
        <h2
          ref={headingRef}
          className={`${SECTION_HEADING_CLASS} text-white mb-8 md:mb-12 max-w-[1300px]`}
        >
          {title}
        </h2>

        {/* Paragraphs */}
        {paragraphs && paragraphs.length > 0 && (
          <div ref={paragraphsRef} className={`mb-12 md:mb-24 space-y-4 md:space-y-6`}>
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[14px] sm:text-[16px] md:text-[20px] font-[350] text-white leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
        </div>

        {/* Service Cards Grid - 4 cards horizontal */}
        {services && Array.isArray(services) && services.length > 0 && (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-5 lg:gap-6 xl:gap-6 2xl:gap-7 min-[1440px]:gap-8 min-[1920px]:gap-8"
          >
            {services.map((service, index) => {
              const bgColor = service.bgColor || "bg-[#1a1a1a]";
              const textColor = service.textColor || "text-white";
              const descColor = textColor === "text-black" ? "text-black/70" : "text-white/70";

              return (
                <div
                  key={index}
                  className={`${bgColor} flex flex-col justify-between items-start gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-9 min-[1440px]:gap-10 min-[1920px]:gap-12 border border-[#BFBFBF] rounded-[10px] py-4 sm:py-5 md:py-6 lg:pt-7 lg:pb-10 xl:pt-8 xl:pb-11 2xl:pt-8 2xl:pb-12 min-[1440px]:pt-9 min-[1440px]:pb-[52px] min-[1920px]:pt-10 min-[1920px]:pb-14 px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 2xl:px-9 min-[1440px]:px-10 min-[1920px]:px-12 hover:border-[#BFBFBF] transition-all duration-300`}
                >
                  <h3 className={`${textColor} text-[18px] sm:text-[20px] md:text-[24px] lg:text-[26px] xl:text-[28px] 2xl:text-[29px] min-[1440px]:text-[29.5px] min-[1920px]:text-[30px] font-[700] mb-2 sm:mb-2.5 md:mb-3 lg:mb-3.5 xl:mb-4 2xl:mb-4 min-[1440px]:mb-4.5 min-[1920px]:mb-5 app-why-opt-service-heading`}>
                    {service.title}
                  </h3>
                  <p className={`${descColor} ${textColor} text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] xl:text-[19px] 2xl:text-[20px] min-[1440px]:text-[20.25px] min-[1920px]:text-[20.5px] font-[350] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] app-why-opt-service-description`}>
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Us Button */}
        {buttonText && buttonText.trim() !== "" && (
          <div ref={buttonRef} className="flex justify-center mt-12 md:mt-16">
            <CallToActionButton variant="shiny" className="rounded-full">
              {buttonText}
            </CallToActionButton>
          </div>
        )}
      </div>

      {/* Background Image - Full Width (when services are not provided) */}
      {backgroundImage && (!services || !Array.isArray(services) || services.length === 0) && (
        <div ref={cardsRef} className="relative w-screen h-[146px] md:h-[748px] left-1/2 -translate-x-1/2">
          {/* Background Image */}
          <Image
            src={backgroundImage}
            alt={backgroundImageAlt}
            fill
            className={`object-contain ${backgroundImageClassName}`}
            priority
            unoptimized
          />
          {/* Optional Overlay */}
          {backgroundOverlay && (
            <div className={`absolute inset-0 bg-black/50 ${backgroundOverlayClassName}`} />
          )}
        </div>
      )}
      </div>
    </section>
  );
}

