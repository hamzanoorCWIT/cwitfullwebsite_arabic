"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";

interface OurClientsProps {
  logoSrc?: string;
  embedded?: boolean;
  className?: string;
}

function useClientsMarquee(logoSource: string) {
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    setImagesLoaded(false);
  }, [logoSource]);

  useEffect(() => {
    if (!logoSource || !carouselTrackRef.current || !imagesLoaded) return;

    const track = carouselTrackRef.current;
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length === 0) return;

    const itemWidth = items[0]?.offsetWidth || window.innerWidth;
    const setWidth = itemWidth;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    animationRef.current = gsap.to(track, {
      x: -setWidth * 2,
      duration: 60,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => {
          const num = parseFloat(x);
          if (num <= -setWidth) {
            return `${num + setWidth}px`;
          }
          return x;
        },
      },
    });

    return () => {
      if (animationRef.current) animationRef.current.kill();
    };
  }, [imagesLoaded, logoSource]);

  return {
    carouselTrackRef,
    handleImageLoad: () => setImagesLoaded(true),
  };
}

export default function OurClients({
  logoSrc,
  embedded = false,
  className = "",
}: OurClientsProps = {}) {
  const trimmed = logoSrc?.trim() || "";
  const { carouselTrackRef, handleImageLoad } = useClientsMarquee(trimmed);

  if (!trimmed) return null;

  const carousel = (
    <div className="overflow-hidden w-full">
      <div
        ref={carouselTrackRef}
        className="flex will-change-transform"
        style={{ width: "fit-content" }}
      >
        {[0, 1].map((setIndex) => (
          <div key={`clients-${setIndex}`} className="flex-shrink-0 w-full mx-8">
            <Image
              src={trimmed}
              alt="Client logos"
              width={1464}
              height={234}
              className="w-full h-auto object-contain"
              unoptimized
              onLoad={setIndex === 0 ? handleImageLoad : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (embedded) {
    return <div className={className}>{carousel}</div>;
  }

  return (
    <section className={`relative bg-black py-20 md:py-34 pt-0 overflow-hidden ${className}`}>
      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-0">{carousel}</div>
    </section>
  );
}
