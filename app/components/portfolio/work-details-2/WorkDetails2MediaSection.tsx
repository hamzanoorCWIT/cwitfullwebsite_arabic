"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./work-details-2.module.css";

const MEDIA_LG_MIN = "(min-width: 1024px)";

type WorkDetails2MediaSectionProps = {
  videoSrc?: string;
  imageSrc?: string;
  videoSrcMobile?: string;
  imageSrcMobile?: string;
  alt: string;
  sectionClassName: string;
  videoClassName: string;
  ariaLabel: string;
  priority?: boolean;
};

export default function WorkDetails2MediaSection({
  videoSrc,
  imageSrc,
  videoSrcMobile,
  imageSrcMobile,
  alt,
  sectionClassName,
  videoClassName,
  ariaLabel,
  priority = false,
}: WorkDetails2MediaSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  const desktopVideo = videoSrc?.trim() || "";
  const desktopImage = imageSrc?.trim() || "";
  const mobileVideo = videoSrcMobile?.trim() || desktopVideo;
  const mobileImage = imageSrcMobile?.trim() || desktopImage;
  const mobilePoster = imageSrcMobile?.trim() || desktopImage;

  const useDesktopVideo = !!desktopVideo;
  const useDesktopImage = !useDesktopVideo && !!desktopImage;
  const useMobileVideo = !!mobileVideo;
  const useMobileImage = !useMobileVideo && !!mobileImage;

  const getVideos = () =>
    [desktopVideoRef.current, mobileVideoRef.current].filter(Boolean) as HTMLVideoElement[];

  const getVisibleVideos = (): HTMLVideoElement[] => {
    if (typeof window === "undefined") return [];
    const isDesktop = window.matchMedia(MEDIA_LG_MIN).matches;
    if (isDesktop) {
      if (useDesktopVideo && desktopVideoRef.current) return [desktopVideoRef.current];
      return [];
    }
    if (useMobileVideo && mobileVideoRef.current) return [mobileVideoRef.current];
    return [];
  };

  useEffect(() => {
    if (useDesktopImage && useMobileImage) return;

    const section = sectionRef.current;
    if (!section) return;

    const safePlay = (video: HTMLVideoElement) => {
      void video.play().catch(() => undefined);
    };

    const pauseAll = () => {
      getVideos().forEach((video) => video.pause());
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          getVisibleVideos().forEach((video) => safePlay(video));
        } else {
          pauseAll();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    getVisibleVideos().forEach((video) => safePlay(video));

    const mq = window.matchMedia(MEDIA_LG_MIN);
    const onBreakpoint = () => {
      pauseAll();
      getVisibleVideos().forEach((video) => safePlay(video));
    };
    mq.addEventListener("change", onBreakpoint);

    return () => {
      mq.removeEventListener("change", onBreakpoint);
      observer.disconnect();
    };
  }, [
    useDesktopImage,
    useMobileImage,
    useDesktopVideo,
    useMobileVideo,
    desktopVideo,
    mobileVideo,
  ]);

  if (
    !useDesktopVideo &&
    !useDesktopImage &&
    !useMobileVideo &&
    !useMobileImage
  ) {
    return null;
  }

  return (
    <section ref={sectionRef} className={sectionClassName} aria-label={ariaLabel}>
      {useDesktopImage ? (
        <div className={`${styles.mediaDesktop} ${styles.mediaImageWrap}`}>
          <Image
            src={desktopImage}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : useDesktopVideo ? (
        <video
          ref={desktopVideoRef}
          src={desktopVideo}
          poster={desktopImage || undefined}
          loop
          muted
          playsInline
          preload="auto"
          className={`${videoClassName} ${styles.mediaDesktop}`}
        />
      ) : null}

      {useMobileImage ? (
        <div className={`${styles.mediaMobile} ${styles.mediaImageWrap}`}>
          <Image
            src={mobileImage}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            unoptimized
          />
        </div>
      ) : useMobileVideo ? (
        <video
          ref={mobileVideoRef}
          key={`m-${mobileVideo}`}
          src={mobileVideo}
          poster={mobilePoster || undefined}
          loop
          muted
          playsInline
          preload="auto"
          className={`${videoClassName} ${styles.mediaMobile}`}
        />
      ) : null}
    </section>
  );
}
