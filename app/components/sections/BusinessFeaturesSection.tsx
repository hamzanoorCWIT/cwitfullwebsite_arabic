"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image, { StaticImageData } from "next/image";
import CallToActionButton from "../ui/CallToActionButton";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface BusinessFeature {
  heading: string | ReactNode;
  description: string | ReactNode;
  headingClassName?: string;
  descriptionClassName?: string;
  className?: string;
}

interface BusinessFeaturesSectionProps {
  title: string | ReactNode;
  features: BusinessFeature[];
  buttonText?: string;
  videoSrc?: string;
  imageSrc?: StaticImageData | string;
  imageAlt?: string;
  imageClassName?: string;
  imageMaxWidth?: string;
  className?: string;
  titleClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
  videoClassName?: string;
  videoElementClassName?: string;
}

export default function BusinessFeaturesSection({
  title,
  features,
  videoSrc,
  imageSrc,
  buttonText,
  imageAlt = "Feature image",
  imageClassName = "",
  imageMaxWidth = "max-w-full",
  className = "",
  titleClassName = "",
  containerClassName = "",
  contentClassName = "",
  videoClassName = "",
  videoElementClassName = "object-contain",
}: BusinessFeaturesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

      // Animate title
      if (titleRef.current) {
        gsap.set(titleRef.current, {
          y: 50,
          opacity: 0,
        });
        tl.to(titleRef.current, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Animate features
      if (featuresRef.current) {
        const featureElements = featuresRef.current.children;
        gsap.set(featureElements, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          featureElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.2,
          },
          "-=0.5"
        );
      }

      // Animate video
      if (videoContainerRef.current) {
        gsap.set(videoContainerRef.current, {
          x: 50,
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

      // Animate image
      if (imageRef.current) {
        gsap.set(imageRef.current, {
          x: 50,
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
          "-=0.3"
        );
      }
    },
    sectionRef,
    [features, buttonText]
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black py-20 md:py-32 overflow-hidden ${className}`}
    >
      <div className={`container mx-auto h-full min-h-screen business-features-content-container ${containerClassName}`}>
        <div className="flex flex-col md:flex-row items-center justify-between h-full min-h-screen gap-8 md:gap-12">
          {/* Left Side - Content */}
          <div
            className={`w-full md:w-1/2 flex flex-col justify-center space-y-8 md:space-y-12 px-4 sm:px-6 lg:px-8 ${contentClassName}`}
          >
            {/* Title */}
            <h2
              ref={titleRef}
              className={`${SECTION_HEADING_CLASS} text-white ${titleClassName}`}
            >
              {title}
            </h2>

            {/* Features List */}
            {features && features.length > 0 && (
              <div ref={featuresRef} className="space-y-8 md:space-y-10">
                {features.map((feature, index) => {
                  const featureHeadingClassName =
                    feature.headingClassName ||
                    "text-[20px] sm:text-[24px] md:text-[28px] lg:text-[36px] font-bold text-white mb-3 md:mb-4 business-features-heading";
                  const featureDescriptionClassName =
                    feature.descriptionClassName ||
                    "text-[14px] sm:text-[16px] md:text-[22px] text-white leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] business-features-description";
                  const featureContainerClassName = feature.className || "";

                  return (
                    <div key={index} className={featureContainerClassName}>
                      {/* Feature Heading */}
                      <h3 className={featureHeadingClassName}>{feature.heading}</h3>

                      {/* Feature Description */}
                      <p
                        className={featureDescriptionClassName}
                        {...(typeof feature.description === "string"
                          ? {
                              dangerouslySetInnerHTML: {
                                __html: normalizeDescriptionHtml(feature.description),
                              },
                            }
                          : { children: feature.description })}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contact Us Button */}
            {buttonText && buttonText.trim() !== "" && (
              <div ref={buttonRef} className="flex justify-start mt-4 md:mt-8">
                <CallToActionButton variant="shiny" className="rounded-full">
                  {buttonText}
                </CallToActionButton>
              </div>
            )}
          </div>

          {/* Right Side - Video (optional) */}
          {videoSrc && (
            <div
              ref={videoContainerRef}
              className={`w-full md:w-1/2 flex items-center justify-center ${videoClassName}`}
            >
              <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] max-w-full overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className={`w-full h-full ${videoElementClassName}`}
                />
              </div>
            </div>
          )}

          {/* Right Side - Image (optional) */}
          {imageSrc && (
            <div
              ref={imageRef}
              className={`w-full md:w-1/2 flex items-center justify-center ${imageClassName}`}
            >
              <div className={`relative w-full max-w-[400px] h-[600px] md:max-h-[500px] lg:max-h-[600px] ${imageMaxWidth} overflow-hidden`}>
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

