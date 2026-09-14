"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useEffect } from "react";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HERO_VIDEO_LG_MIN = "(min-width: 1024px)";

interface HeroProps {
  videoSrc?: string;
  imageSrc?: string;
  videoSrcMobile?: string;
  imageSrcMobile?: string;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
}

export default function Hero({
  videoSrc,
  imageSrc,
  videoSrcMobile,
  imageSrcMobile,
  title,
  subtitle,
  titleClassName = "mb-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl",
}: HeroProps = {}) {
  const customVideoSrc = videoSrc?.trim() || "";
  const hasCustomVideo = customVideoSrc.length > 0;
  const cmsPoster = imageSrc?.trim() || "";
  /** Desktop full-bleed image when there is no desktop CMS video */
  const useImageDesktop = !customVideoSrc && !!cmsPoster;

  const mobileCmsVideo = videoSrcMobile?.trim() || "";
  const mobileCmsPoster = imageSrcMobile?.trim() || "";
  const mobileVideoPlayback =
    mobileCmsVideo || customVideoSrc || "";
  const hasMobileCustomUpload = !!(mobileCmsVideo || customVideoSrc);
  const mobilePosterEffective = mobileCmsPoster || cmsPoster || "";
  /** Mobile full-bleed image when there is no video source on mobile (no mobile upload, no desktop video) */
  const useImageMobile =
    !mobileCmsVideo &&
    !customVideoSrc &&
    !!(mobileCmsPoster || (useImageDesktop && cmsPoster));

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const getAllHeroVideos = (): HTMLVideoElement[] =>
    [videoRef.current, mobileVideoRef.current].filter(Boolean) as HTMLVideoElement[];

  const getVisibleHeroVideos = (): HTMLVideoElement[] => {
    if (typeof window === "undefined") return [];
    const desktop = videoRef.current;
    const mobile = mobileVideoRef.current;
    if (window.matchMedia(HERO_VIDEO_LG_MIN).matches) {
      if (useImageDesktop || !desktop) return [];
      return [desktop];
    }
    if (useImageMobile || !mobile) return [];
    return [mobile];
  };

  // Video play/pause based on section visibility (only when using video)
  useEffect(() => {
    if (useImageDesktop && useImageMobile) return;
    const section = heroRef.current;
    if (!section) return;

    const safePlay = (v: HTMLVideoElement) => {
      void v.play()?.catch(() => {});
    };

    const pauseAll = () => {
      getAllHeroVideos().forEach((v) => {
        v.pause();
      });
    };

    pauseAll();

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "60% top",
      onEnter: () => {
        setTimeout(() => {
          getVisibleHeroVideos().forEach((v) => safePlay(v));
        }, 1500);
      },
      onLeave: () => {
        pauseAll();
      },
      onEnterBack: () => {
        getVisibleHeroVideos().forEach((v) => safePlay(v));
      },
      onLeaveBack: () => {
        pauseAll();
      },
    });

    const opacityTween = gsap.to(getAllHeroVideos(), {
      opacity: 0,
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "60% top",
        scrub: true,
      },
    });

    const mq = window.matchMedia(HERO_VIDEO_LG_MIN);
    const onBreakpoint = () => {
      pauseAll();
      ScrollTrigger.refresh();
      getVisibleHeroVideos().forEach((v) => safePlay(v));
    };
    mq.addEventListener("change", onBreakpoint);

    return () => {
      mq.removeEventListener("change", onBreakpoint);
      pauseAll();
      trigger.kill();
      if (opacityTween.scrollTrigger) opacityTween.scrollTrigger.kill();
      opacityTween.kill();
    };
  }, [useImageDesktop, useImageMobile, customVideoSrc, mobileCmsVideo]);

  const hasText = !!(title?.trim() || subtitle?.trim());

  useGSAP(
    () => {
      const tl = gsap.timeline();
      const mediaNodes = heroRef.current?.querySelectorAll(".hero-bg-media");
      if (mediaNodes?.length) {
        tl.from(Array.from(mediaNodes), {
          opacity: 0,
          scale: 1.1,
          duration: 1.5,
          ease: "power2.out",
        });
      }

      if (!hasText) return;

      if (titleRef.current) {
        tl.from(
          titleRef.current,
          { y: 50, opacity: 0, duration: 1, ease: "power3.out" },
          "-=1"
        );
      }
      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          { y: 30, opacity: 0, duration: 0.8, ease: "power2.out" },
          "-=0.5"
        );
      }
    },
    heroRef,
    [hasText, useImageDesktop, useImageMobile, title, subtitle]
  );

  const mobileImgSrc = mobileCmsPoster || (useImageDesktop ? cmsPoster : "");

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative flex items-center justify-center h-screen md:min-h-screen overflow-hidden w-full"
    >
      <div className="absolute inset-0 z-0 w-full h-full">
        {useImageDesktop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc!}
            alt=""
            className="hero-bg-media hidden lg:block w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={hasCustomVideo ? customVideoSrc : undefined}
            loop
            muted
            playsInline
            preload="auto"
            poster={cmsPoster || ""}
            className="hero-bg-media hidden lg:block w-full h-full object-cover"
          />
        )}

        {useImageMobile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mobileImgSrc}
            alt=""
            className="hero-bg-media lg:hidden w-full h-full object-cover"
          />
        ) : (
          <video
            key={
              hasMobileCustomUpload
                ? `m-${mobileCmsVideo || customVideoSrc}`
                : "m-default"
            }
            ref={mobileVideoRef}
            src={mobileVideoPlayback || undefined}
            loop
            muted
            playsInline
            preload="auto"
            poster={mobilePosterEffective}
            className="hero-bg-media lg:hidden w-full h-full object-cover"
          />
        )}
      </div>

      {hasText && (
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-none">
          <div className="mx-auto max-w-4xl text-center">
            {title?.trim() ? (
              <h1
                ref={titleRef}
                className={titleClassName}
              >
                {title.trim()}
              </h1>
            ) : null}
            {subtitle?.trim() ? (
              <p
                ref={subtitleRef}
                className="text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl"
                dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(subtitle.trim()) }}
              />
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
