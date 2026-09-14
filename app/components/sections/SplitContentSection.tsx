"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CallToActionButton from "../ui/CallToActionButton";
import Image, { StaticImageData } from "next/image";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SplitContentSectionProps {
  title: string | ReactNode;
  description: string | ReactNode;
  buttonText?: string;
  image?: StaticImageData | string;
  imageAlt?: string;
  videoSrc?: string;
  videoElementClassName?: string;
  layout?: "content-left" | "content-right";
  contentMaxWidth?: string;
  imageMaxWidth?: string;
  imageClassName?: string;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export default function SplitContentSection({
  title,
  description,
  buttonText,
  image,
  imageAlt = "Content image",
  videoSrc,
  videoElementClassName = "object-contain",
  layout = "content-left",
  contentMaxWidth = "max-w-full",
  imageMaxWidth,
  imageClassName = "",
  className = "",
  contentClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}: SplitContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

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

      // Animate description
      if (descriptionRef.current) {
        gsap.set(descriptionRef.current, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          descriptionRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          },
          "-=0.5"
        );
      }

      // Animate image
      if (imageRef.current && image) {
        gsap.set(imageRef.current, {
          x: layout === "content-right" ? -50 : 50,
          opacity: 0,
          scale: 0.95,
        });
        tl.to(
          imageRef.current,
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }

      // Animate video
      if (videoContainerRef.current && videoSrc) {
        gsap.set(videoContainerRef.current, {
          x: layout === "content-right" ? -50 : 50,
          opacity: 0,
          scale: 0.95,
        });
        tl.to(
          videoContainerRef.current,
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }

      // Animate button
      if (buttonRef.current && buttonText && buttonText.trim() !== "") {
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
          "-=0.4"
        );
      }
    },
    sectionRef,
    [layout, image, videoSrc, buttonText]
  );

  const isContentRight = layout === "content-right";

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-30 min-[1440px]:py-32 min-[1920px]:py-36 overflow-hidden ${className}`}
    >
      <div className="h-full min-h-screen">
        <div
          className={`flex flex-col ${isContentRight ? "md:flex-row-reverse" : "md:flex-row"} ${contentMaxWidth} items-center justify-between h-full min-h-screen gap-6 sm:gap-7 md:gap-8 lg:gap-10 xl:gap-11 2xl:gap-12 min-[1440px]:gap-14 min-[1920px]:gap-16`}
        >
          {/* Content Section */}
          <div
            ref={contentRef}
            className={`container mx-auto flex flex-col justify-end px-4 sm:px-6 md:ps-26 lg:ps-38 xl:ps-46 2xl:ps-60 space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8 2xl:space-y-9 min-[1440px]:space-y-10 min-[1920px]:space-y-12 ${contentClassName}`}
          >
            {/* Heading */}
            <h1
              ref={headingRef}
              className={`text-[32px] sm:text-[40px] md:text-[36px] lg:text-[40px] xl:text-[48px] 2xl:text-[58px] min-[1440px]:text-[59px] min-[1920px]:text-[60px] font-[700] text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] 2xl:leading-[1.25] split-content-title ${titleClassName}`}
            >
              {title}
            </h1>

            {/* Description */}
            <div
              ref={descriptionRef}
              className={`text-[14px] sm:text-[15px] md:text-[15px] lg:text-[16px] xl:text-[19px] 2xl:text-[20px] min-[1440px]:text-[20.25px] min-[1920px]:text-[20.5px] max-w-full md:max-w-[600px] lg:max-w-[650px] xl:max-w-[680px] 2xl:max-w-[700px] min-[1440px]:max-w-[706px] min-[1920px]:max-w-[720px] text-white leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] split-content-description ${descriptionClassName}`}
              {...(typeof description === "string"
                ? { dangerouslySetInnerHTML: { __html: normalizeDescriptionHtml(description) } }
                : { children: description })}
            />

            {/* Contact Us Button */}
            {buttonText && (
              <div ref={buttonRef} className="pt-3 sm:pt-3.5 md:pt-4 lg:pt-4.5 xl:pt-5 2xl:pt-5 min-[1440px]:pt-6 min-[1920px]:pt-6">
                <CallToActionButton variant="shiny" className="rounded-full">
                  {buttonText}
                </CallToActionButton>
              </div>
            )}
          </div>

          {/* Image Section */}
          {image && (
            <div
              ref={imageRef}
              className={`w-full flex items-center justify-end ${imageClassName}`}
            >
              <div className={`relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] 2xl:h-[700px] min-[1440px]:h-[750px] min-[1920px]:h-[800px] min-[2560px]:h-[850px] ${imageMaxWidth} overflow-hidden split-content-image-container`}>
                <Image
                  src={image}
                  alt={imageAlt}
                  fill
                  className="object-cover object-left rounded-[15px] sm:rounded-l-[18px] md:rounded-l-[22px] lg:rounded-l-[25px] xl:rounded-l-[28px] 2xl:rounded-l-[30px] min-[1440px]:rounded-l-[32px] min-[1920px]:rounded-l-[35px] min-[2560px]:rounded-l-[40px]"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Video Section */}
          {videoSrc && (
            <div
              ref={videoContainerRef}
              className={`w-full flex items-center justify-end ${imageClassName}`}
            >
              <div className={`relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] 2xl:h-[700px] min-[1440px]:h-[750px] min-[1920px]:h-[800px] ${imageMaxWidth} overflow-hidden rounded-[15px] sm:rounded-[18px] md:rounded-l-[22px] lg:rounded-l-[25px] xl:rounded-l-[28px] 2xl:rounded-l-[30px] min-[1440px]:rounded-l-[32px] min-[1920px]:rounded-l-[35px]`}>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full ${videoElementClassName} rounded-l-[15px] sm:rounded-l-[18px] md:rounded-l-[22px] lg:rounded-l-[25px] xl:rounded-l-[28px] 2xl:rounded-l-[30px] min-[1440px]:rounded-l-[32px] min-[1920px]:rounded-l-[35px]`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

