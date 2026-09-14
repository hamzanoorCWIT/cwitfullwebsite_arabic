"use client";

import Image from "next/image";
import { useRef, useEffect, ReactNode } from "react";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DigitalExperienceBannerProps {
  title?: string | ReactNode;
  /** Optional small line shown directly under the title (e.g. tagline). */
  subtitle?: string;
  description?: string;
  /** Optional classes appended to the description paragraph (e.g. a max-width). */
  descriptionClassName?: string;
  /** Optional classes appended to the title heading (e.g. mobile top margin). */
  titleClassName?: string;
  /** Override title/subtitle/description font (e.g. "font-inter"). */
  fontClassName?: string;
  videoSrc?: string;
  contactForm?: ReactNode;
  backgroundImage?: {
    src: string;
    alt: string;
    style?: React.CSSProperties;
  };
  /**
   * How the CMS background fills the banner.
   * - decorative: large offset vector-style (studio pages)
   * - cover: fill entire banner (full bleed)
   * - banner-bottom: height matches banner only, anchored to the bottom (blog detail)
   */
  backgroundFit?: "decorative" | "cover" | "banner-bottom";
  className?: string;
  minHeight?: string;
  /** Vertical alignment of title/description block. */
  contentAlign?: "center" | "bottom";
  /** Desktop/tablet video placement. Default sits lower on the right; `top-right` aligns upper-right, moderately below the top (not flush to the edge). */
  videoPosition?: "default" | "top-right";
}

export default function DigitalExperienceBanner({
  title,
  subtitle,
  description,
  descriptionClassName = "",
  titleClassName = "",
  fontClassName = "",
  videoSrc,
  contactForm,
  backgroundImage,
  backgroundFit = "decorative",
  className = "",
  minHeight,
  contentAlign = "center",
  videoPosition = "default",
}: DigitalExperienceBannerProps) {
  const { locale } = useLocalePreference();
  const isRtl = locale === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contactFormRef = useRef<HTMLDivElement>(null);
  const vectorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const mobileVideoContainerRef = useRef<HTMLDivElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVisibleVideos = () => {
      const videos = [videoRef.current, mobileVideoRef.current].filter(Boolean) as HTMLVideoElement[];
      for (const video of videos) {
        void video.play()?.catch(() => {});
      }
    };

    const desktopVideo = videoRef.current;
    const mobileVideo = mobileVideoRef.current;

    playVisibleVideos();
    desktopVideo?.addEventListener("loadeddata", playVisibleVideos);
    mobileVideo?.addEventListener("loadeddata", playVisibleVideos);

    return () => {
      desktopVideo?.removeEventListener("loadeddata", playVisibleVideos);
      mobileVideo?.removeEventListener("loadeddata", playVisibleVideos);
      desktopVideo?.pause();
      mobileVideo?.pause();
    };
  }, [videoSrc]);

  // Set responsive styles for video and contact form
  useEffect(() => {
    const updateResponsiveStyles = () => {
      const width = window.innerWidth;
      const cssOwnsVector =
        className.includes("tunedBanner") || className.includes("blogBanner");
      // dxBanner CSS owns video from 1685px down (tablet/mobile inclusive)
      const cssOwnsVideo =
        className.includes("dxBanner") && width <= 1685;

      // Update video container styles
      if (videoContainerRef.current && videoSrc) {
        if (cssOwnsVideo) {
          // Clear inline layout so dx CSS catering wins
          videoContainerRef.current.style.left = "";
          videoContainerRef.current.style.right = "";
          videoContainerRef.current.style.top = "";
          videoContainerRef.current.style.bottom = "";
          videoContainerRef.current.style.width = "";
          videoContainerRef.current.style.height = "";
          videoContainerRef.current.style.aspectRatio = "";
          videoContainerRef.current.style.maxWidth = "";
          videoContainerRef.current.style.zIndex = "";
        } else if (videoPosition === "top-right") {
          videoContainerRef.current.style.left = "auto";
          videoContainerRef.current.style.height = "auto";
          videoContainerRef.current.style.aspectRatio = "16 / 9";
          videoContainerRef.current.style.bottom = "";
          videoContainerRef.current.style.maxWidth = "";
          if (width >= 1280) {
            videoContainerRef.current.style.width = "clamp(460px, 40vw, 680px)";
            videoContainerRef.current.style.top = "240px";
            videoContainerRef.current.style.right = "80px";
          } else if (width >= 1024) {
            videoContainerRef.current.style.width = "clamp(400px, 44vw, 560px)";
            videoContainerRef.current.style.top = "clamp(200px, 24vh, 300px)";
            videoContainerRef.current.style.right = "clamp(30px, 4vw, 50px)";
          } else if (width >= 768) {
            videoContainerRef.current.style.width = "clamp(340px, 48vw, 460px)";
            videoContainerRef.current.style.top = "clamp(180px, 22vh, 260px)";
            videoContainerRef.current.style.right = "clamp(20px, 5vw, 40px)";
          }
        } else if (width >= 1280) {
          // xl (1280px+)
          videoContainerRef.current.style.right = "auto";
          videoContainerRef.current.style.width = '1162px';
          videoContainerRef.current.style.height = '654px';
          videoContainerRef.current.style.top = '500px';
          videoContainerRef.current.style.left = '681px';
        } else if (width >= 1024) {
          // lg (1024px-1279px)
          videoContainerRef.current.style.right = "auto";
          videoContainerRef.current.style.width = 'clamp(700px, 65vw, 900px)';
          videoContainerRef.current.style.height = 'clamp(394px, 36.5vw, 506px)';
          videoContainerRef.current.style.top = 'clamp(400px, 45vh, 500px)';
          videoContainerRef.current.style.left = 'clamp(400px, 40vw, 550px)';
        } else if (width >= 768) {
          // md (768px-1023px)
          videoContainerRef.current.style.right = "auto";
          videoContainerRef.current.style.width = 'clamp(400px, 60vw, 800px)';
          videoContainerRef.current.style.height = 'clamp(225px, 33.75vw, 450px)';
          videoContainerRef.current.style.top = 'clamp(350px, 40vh, 450px)';
          videoContainerRef.current.style.left = 'clamp(300px, 35vw, 500px)';
        }
      }

      // Update contact form container styles
      if (contactFormRef.current && contactForm) {
        const formSide = isRtl ? "left" : "right";
        const formOther = isRtl ? "right" : "left";
        if (width >= 1280) {
          // xl (1280px+) — CSS media rules own placement
          contactFormRef.current.style.maxWidth = '742px';
          contactFormRef.current.style.top = 'auto';
          contactFormRef.current.style.right = 'auto';
          contactFormRef.current.style.left = 'auto';
        } else if (width >= 1024) {
          // lg (1024px-1279px)
          contactFormRef.current.style.maxWidth = 'clamp(650px, 60vw, 700px)';
          contactFormRef.current.style.top = 'clamp(400px, 45vh, 500px)';
          contactFormRef.current.style[formSide] = 'clamp(30px, 4vw, 50px)';
          contactFormRef.current.style[formOther] = 'auto';
        } else if (width >= 768) {
          // md (768px-1023px)
          contactFormRef.current.style.maxWidth = 'clamp(500px, 55vw, 650px)';
          contactFormRef.current.style.top = 'clamp(350px, 40vh, 450px)';
          contactFormRef.current.style[formSide] = 'clamp(20px, 5vw, 40px)';
          contactFormRef.current.style[formOther] = 'auto';
        }
      }

      // Update vector background styles (skip tuned/blog banner — CSS controls it)
      if (vectorRef.current && !cssOwnsVector) {
        const side = isRtl ? "right" : "left";
        const otherSide = isRtl ? "left" : "right";
        vectorRef.current.style[otherSide] = "auto";
        if (width >= 1280) {
          // xl (1280px+)
          vectorRef.current.style.width = '1364px';
          vectorRef.current.style.height = '2200px';
          vectorRef.current.style.top = '-490px';
          vectorRef.current.style[side] = '0';
        } else if (width >= 1024) {
          // lg (1024px-1279px)
          vectorRef.current.style.width = 'clamp(1100px, 85vw, 1200px)';
          vectorRef.current.style.height = 'clamp(1800px, 200vh, 2000px)';
          vectorRef.current.style.top = 'clamp(-350px, -30vh, -250px)';
          vectorRef.current.style[side] = 'clamp(-150px, -8vw, -50px)';
        } else if (width >= 768) {
          // md (768px-1023px)
          vectorRef.current.style.width = 'clamp(800px, 100vw, 1100px)';
          vectorRef.current.style.height = 'clamp(1400px, 180vh, 1800px)';
          vectorRef.current.style.top = 'clamp(-300px, -25vh, -200px)';
          vectorRef.current.style[side] = 'clamp(-200px, -10vw, -100px)';
        }
      }

      // Update mobile video container and video styles
      if (mobileVideoContainerRef.current && videoSrc) {
        if (cssOwnsVideo) {
          mobileVideoContainerRef.current.style.left = "";
          mobileVideoContainerRef.current.style.right = "";
          mobileVideoContainerRef.current.style.top = "";
          mobileVideoContainerRef.current.style.bottom = "";
          mobileVideoContainerRef.current.style.width = "";
          mobileVideoContainerRef.current.style.height = "";
          mobileVideoContainerRef.current.style.maxWidth = "";
          mobileVideoContainerRef.current.style.transform = "";
          mobileVideoContainerRef.current.style.justifyContent = "";
          mobileVideoContainerRef.current.style.alignItems = "";
          mobileVideoContainerRef.current.style.zIndex = "";
        } else if (videoPosition === "top-right") {
          mobileVideoContainerRef.current.style.left = "auto";
          mobileVideoContainerRef.current.style.right = "clamp(12px, 4vw, 24px)";
          mobileVideoContainerRef.current.style.transform = "none";
          mobileVideoContainerRef.current.style.justifyContent = "flex-end";
          mobileVideoContainerRef.current.style.height = "auto";
          if (width >= 640) {
            mobileVideoContainerRef.current.style.maxWidth = "60%";
            mobileVideoContainerRef.current.style.top = "180px";
          } else if (width >= 480) {
            mobileVideoContainerRef.current.style.maxWidth = "58%";
            mobileVideoContainerRef.current.style.top = "165px";
          } else {
            mobileVideoContainerRef.current.style.maxWidth = "55%";
            mobileVideoContainerRef.current.style.top = "150px";
          }
        } else if (width >= 768) {
          // Tablet (768px-1023px) - should not show, but just in case
          mobileVideoContainerRef.current.style.height = 'clamp(400px, 50vh, 500px)';
          mobileVideoContainerRef.current.style.maxWidth = '85%';
        } else if (width >= 640) {
          // Small screens (640px-767px)
          mobileVideoContainerRef.current.style.height = 'clamp(350px, 45vh, 450px)';
          mobileVideoContainerRef.current.style.maxWidth = '80%';
          mobileVideoContainerRef.current.style.top = '200px';
        } else if (width >= 480) {
          // Medium mobile (480px-639px)
          mobileVideoContainerRef.current.style.height = 'clamp(320px, 42vh, 400px)';
          mobileVideoContainerRef.current.style.maxWidth = '75%';
          mobileVideoContainerRef.current.style.top = '180px';
        } else {
          // Small mobile (375px-479px)
          mobileVideoContainerRef.current.style.height = 'clamp(300px, 40vh, 380px)';
          mobileVideoContainerRef.current.style.maxWidth = '70%';
          mobileVideoContainerRef.current.style.top = '170px';
        }
      }

      if (mobileVideoRef.current && videoSrc) {
        if (cssOwnsVideo) {
          mobileVideoRef.current.style.maxHeight = "";
          mobileVideoRef.current.style.maxWidth = "";
          mobileVideoRef.current.style.width = "";
          mobileVideoRef.current.style.height = "";
          mobileVideoRef.current.style.objectFit = "";
        } else if (videoPosition === "top-right") {
          mobileVideoRef.current.style.maxHeight = "none";
          mobileVideoRef.current.style.maxWidth = "100%";
          mobileVideoRef.current.style.width = "100%";
          mobileVideoRef.current.style.height = "auto";
          mobileVideoRef.current.style.objectFit = "contain";
        } else if (width >= 768) {
          mobileVideoRef.current.style.maxHeight = 'clamp(280px, 36vh, 360px)';
          mobileVideoRef.current.style.maxWidth = '80%';
        } else if (width >= 640) {
          mobileVideoRef.current.style.maxHeight = 'clamp(250px, 34vh, 320px)';
          mobileVideoRef.current.style.maxWidth = '75%';
        } else if (width >= 480) {
          mobileVideoRef.current.style.maxHeight = 'clamp(230px, 32vh, 300px)';
          mobileVideoRef.current.style.maxWidth = '70%';
        } else {
          mobileVideoRef.current.style.maxHeight = 'clamp(210px, 30vh, 280px)';
          mobileVideoRef.current.style.maxWidth = '65%';
        }
      }
    };

    updateResponsiveStyles();
    window.addEventListener('resize', updateResponsiveStyles);
    return () => window.removeEventListener('resize', updateResponsiveStyles);
  }, [videoSrc, contactForm, backgroundImage?.src, videoPosition, className, isRtl]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Create a master timeline for entrance animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Set initial states for all elements
      if (vectorRef.current) {
        gsap.set(vectorRef.current, {
          opacity: 0,
          scale: 1.1,
        });
        // Animate vector background
        tl.to(vectorRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power2.out",
        });
      }

      if (overlayRef.current) {
        gsap.set(overlayRef.current, {
          opacity: 0,
        });
        // Animate overlay
        tl.to(
          overlayRef.current,
          {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out",
          },
          "<0.2"
        );
      }

      // Animate video
      if (videoSrc && videoRef.current) {
        gsap.set(videoRef.current, {
          opacity: 0,
          scale: 0.9,
          x: 50,
        });
        tl.to(
          videoRef.current,
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          "<0.3"
        );
      }

      // Animate contact form
      if (contactForm && contactFormRef.current) {
        gsap.set(contactFormRef.current, {
          opacity: 0,
          scale: 0.95,
          x: 50,
        });
        tl.to(
          contactFormRef.current,
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 1.2,
            ease: "power2.out",
          },
          "<0.3"
        );
      }

      // Animate content wrapper
      if (contentWrapperRef.current) {
        gsap.set(contentWrapperRef.current, {
          opacity: 0,
        });
        tl.to(
          contentWrapperRef.current,
          {
            opacity: 1,
            duration: 0.5,
            ease: "power1.out",
          },
          "<0.2"
        );
      }

      // Animate heading
      if (headingRef.current) {
        gsap.set(headingRef.current, {
          opacity: 0,
          y: 50,
        });
        tl.to(
          headingRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          },
          "<0.3"
        );
      }

      // Animate subtitle
      if (subtitle && subtitleRef.current) {
        gsap.set(subtitleRef.current, {
          opacity: 0,
          y: 30,
        });
        tl.to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "<0.2"
        );
      }

      // Animate description text
      if (description && textRef.current) {
        gsap.set(textRef.current, {
          opacity: 0,
          y: 30,
        });
        tl.to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "<0.2"
        );
      }

      // Parallax effects on scroll
      if (vectorRef.current) {
        gsap.to(vectorRef.current, {
          y: -100,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (videoSrc && videoRef.current) {
        gsap.to(videoRef.current, {
          y: -50,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (contactForm && contactFormRef.current) {
        gsap.to(contactFormRef.current, {
          y: -30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [description, subtitle, videoSrc, contactForm, backgroundImage?.src]);


  return (
    <section
      id="contact-form-section"
      ref={sectionRef}
      className={`relative bg-black overflow-hidden min-h-[500px] sm:min-h-[550px] md:min-h-[900px] lg:min-h-[1000px] xl:min-h-[1180px] isolate ${className}`}
      style={{
        width: "100%",
        ...(minHeight ? { minHeight } : {}),
      }}
    >
      {/* Background Video - Right Side */}
      {videoSrc && (
        <div 
          ref={videoContainerRef}
          className={`absolute hidden md:block pointer-events-none digital-experience-video-container${videoPosition === "top-right" ? " digital-experience-video-container--top-right" : ""}`}
          style={{
            zIndex: 25,
            // Base styles for md (768px-1023px) - will be updated by useEffect
            width: videoPosition === "top-right" ? 'clamp(340px, 48vw, 460px)' : 'clamp(400px, 60vw, 800px)',
            ...(videoPosition === "top-right"
              ? { height: 'auto', aspectRatio: '16 / 9', right: 'clamp(20px, 5vw, 40px)', left: 'auto' }
              : {
                  height: 'clamp(225px, 33.75vw, 450px)',
                  left: 'clamp(300px, 35vw, 500px)',
                }),
            top: videoPosition === "top-right" ? 'clamp(180px, 22vh, 260px)' : 'clamp(350px, 40vh, 450px)',
          }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`w-full h-full ${
              videoPosition === "top-right"
                ? "object-contain digital-experience-banner-video-top-right"
                : "object-contain digital-experience-banner-video"
            }`}
          />
        </div>
      )}
      {/* Background Video - Mobile View */}
      {videoSrc && (
        <div 
          ref={mobileVideoContainerRef}
          className={`absolute md:hidden pointer-events-none flex items-center ${
            videoPosition === "top-right"
              ? "justify-end right-0 digital-experience-video-container--mobile-top-right"
              : "w-full left-1/2 transform -translate-x-1/2 justify-center"
          }`}
          style={{
            zIndex: 25,
            // Base styles for small mobile (375px) - will be updated by useEffect
            height: videoPosition === "top-right" ? 'auto' : 'clamp(300px, 40vh, 380px)',
            maxWidth: videoPosition === "top-right" ? '55%' : '70%',
            top: videoPosition === "top-right" ? '150px' : '170px',
            ...(videoPosition === "top-right"
              ? { right: 'clamp(12px, 4vw, 24px)', left: 'auto', transform: 'none' }
              : {}),
          }}
        >
          <video
            ref={mobileVideoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={`w-full h-auto rounded-lg object-contain ${
              videoPosition === "top-right" ? "digital-experience-banner-video-top-right" : ""
            }`}
            style={{
              // Base styles for small mobile - will be updated by useEffect
              maxHeight: videoPosition === "top-right" ? undefined : 'clamp(210px, 30vh, 280px)',
              maxWidth: videoPosition === "top-right" ? '100%' : '75%',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
      {/* Contact Form - Right in EN / Left in AR (mirrors RTL) - Desktop Only */}
      {contactForm && (
        <div
          ref={contactFormRef}
          className="contact-form-container w-full hidden md:block absolute z-40 px-4 md:px-6 lg:px-8 xl:px-0 pointer-events-auto"
          style={{
            // Base styles for md (768px-1023px) - will be updated by useEffect
            maxWidth: 'clamp(500px, 55vw, 650px)',
            top: 'clamp(350px, 40vh, 450px)',
            ...(isRtl
              ? { left: 'clamp(20px, 5vw, 40px)', right: 'auto' }
              : { right: 'clamp(20px, 5vw, 40px)' }),
          }}
        >
          <div className="w-full">
            {contactForm}
          </div>
        </div>
      )}

      {/* Background Image — only when CMS provides src */}
      {backgroundImage?.src ? (
        backgroundFit === "banner-bottom" ? (
          <div
            className="digital-experience-banner-mask absolute inset-x-0 bottom-0 top-0 pointer-events-none"
            style={{ zIndex: 20, ...backgroundImage.style }}
          >
            <Image
              src={backgroundImage.src}
              alt={backgroundImage.alt || ""}
              fill
              className="object-contain object-left-bottom"
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
        ) : backgroundFit === "cover" ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 20, ...backgroundImage.style }}
          >
            <Image
              src={backgroundImage.src}
              alt={backgroundImage.alt || ""}
              fill
              className="object-cover object-center"
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
        ) : (
        <>
          <div
            ref={vectorRef}
            className="absolute hidden md:block pointer-events-none vector-background digital-experience-banner-mask"
            style={{
              zIndex: 20,
              width: 'clamp(800px, 100vw, 1100px)',
              height: 'clamp(1400px, 180vh, 1800px)',
              transform: 'rotate(0)',
              top: 'clamp(-300px, -25vh, -200px)',
              ...(isRtl
                ? { right: 'clamp(-200px, -10vw, -100px)', left: 'auto' }
                : { left: 'clamp(-200px, -10vw, -100px)' }),
              ...(className.includes("tunedBanner") || className.includes("blogBanner")
                ? {}
                : backgroundImage?.style || {}),
            }}
          >
            <Image
              src={backgroundImage.src}
              alt={backgroundImage.alt || ""}
              width={1364}
              height={2200}
              className="object-contain"
              priority
              unoptimized
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
          <div
            className="digital-experience-banner-mask absolute inset-0 md:hidden pointer-events-none"
            style={{
              zIndex: 20,
            }}
          >
            <Image
              src={backgroundImage.src}
              alt={backgroundImage.alt || ""}
              fill
              className="object-cover object-center"
              priority
              unoptimized
              sizes="100vw"
            />
          </div>
        </>
        )
      ) : null}

      {/* Content - Positioned within the green curved section */}
      <div
        ref={contentRef}
        className={`relative z-30 h-full flex pointer-events-none ${
          contentAlign === "bottom" ? "items-end" : "items-center"
        }`}
      >
        <div
          ref={contentWrapperRef}
          className={`max-w-[1400px] w-full h-full min-h-[500px] sm:min-h-[550px] md:min-h-[700px] lg:min-h-[750px] xl:min-h-[724px] flex flex-col md:flex-row justify-start ps-4 pe-4 sm:ps-5 sm:pe-5 md:ps-6 lg:ps-8 xl:ps-30 ${
            contentAlign === "bottom"
              ? "items-end pb-6 sm:pb-8 md:pb-10 lg:pb-12"
              : "items-center"
          }`}
        >
          <div
            className={`digital-experience-banner-content ps-2 md:ps-4 lg:ps-12 xl:ps-8 pointer-events-auto w-full max-w-full text-left md:max-xl:mr-20 md:max-xl:pe-10 lg:max-xl:mr-32 lg:max-xl:pe-14 xl:mr-0 xl:pe-0 xl:max-w-[1264px] ${
              contentAlign === "bottom"
                ? "pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40"
                : "pt-34 sm:pt-34 md:pt-30 lg:pt-50 xl:pt-70"
            }`}
          >
            <h1
              ref={headingRef}
              className={`text-[22px] sm:text-[32px] md:text-[50px] lg:text-[65px] xl:text-[80px] font-[300] text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] 2xl:leading-[1.25] mb-3 sm:mb-4 md:mb-5 lg:mb-6 contact-form-heading ${fontClassName || "font-graphik"} ${titleClassName}`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                ref={subtitleRef}
                className={`text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[20px] font-[300] tracking-wide text-[#D9D9D9] -mt-1 mb-2 sm:mb-4 md:mb-6 lg:mb-8 contact-form-subtitle ${fontClassName || "font-graphik"}`}
              >
                {subtitle}
              </p>
            )}
            {description && (
              <p
                ref={textRef}
                className={`text-[14px] sm:text-[15px] md:text-[16px] lg:text-[18px] xl:text-[30px] font-light text-white leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] digital-experience-banner-description ${fontClassName || "font-gilroy"} ${descriptionClassName}`}
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(description) }}
              />
            )}
          </div>
          {/* Contact Form - Mobile View (below heading) */}
          {contactForm && (
            <div className="md:hidden w-full mt-6 sm:mt-8 pointer-events-auto px-2 sm:px-4">
              {contactForm}
            </div>
          )}
        </div>
      </div>

    </section>
  );
}

