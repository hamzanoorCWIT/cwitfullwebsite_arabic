"use client";

import { useRef } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import middEllipseImg from "@/app/assets/imgs/midd_ellipse_360.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StatItem {
  number: string;
  label: string;
}

interface AppStatsSectionProps {
  stats?: StatItem[];
  className?: string;
}

const defaultStats: StatItem[] = [
  {
    number: "100+",
    label: "Mobile / Web Applications",
  },
  {
    number: "12",
    label: "Years of Market Experience",
  },
  {
    number: "30+",
    label: "In-house Team Members",
  },
  {
    number: "99+",
    label: "Projects Finished",
  },
];

const videoSrc = "/videos/animated_clip_3.mp4";

export default function AppStatsSection({
  stats = defaultStats,
  className = "",
}: AppStatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Extract numeric value and suffix from stat number
  const getNumberValue = (numberStr: string) => {
    const match = numberStr.match(/(\d+)(.*)/);
    if (match) {
      return {
        value: parseInt(match[1], 10),
        suffix: match[2] || "",
      };
    }
    return { value: 0, suffix: "" };
  };

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

      // Animate video
      if (videoRef.current) {
        gsap.set(videoRef.current, {
          opacity: 0,
          scale: 0.9,
        });
        tl.to(videoRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power2.out",
        });
      }

      // Animate stats
      if (statsRef.current) {
        const statElements = statsRef.current.children;
        gsap.set(statElements, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          statElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
          },
          "-=0.6"
        );
      }

      // Animate number counting
      const counterAnimations = numberRefs.current.map((numberEl, index) => {
        if (!numberEl) return null;

        const stat = stats[index];
        const { value: targetValue, suffix } = getNumberValue(stat.number);

        // Set initial value to 0
        numberEl.textContent = `0${suffix}`;

        // Create counter animation object
        const counterObj = { value: 0 };
        
        return gsap.to(counterObj, {
          value: targetValue,
          duration: 2,
          ease: "power2.out",
          onUpdate: function () {
            if (numberEl) {
              const currentValue = Math.floor(counterObj.value);
              numberEl.textContent = `${currentValue}${suffix}`;
            }
          },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Cleanup function
      return () => {
        counterAnimations.forEach((anim) => {
          if (anim && anim.scrollTrigger) {
            anim.scrollTrigger.kill();
            anim.kill();
          }
        });
      };
    },
    sectionRef,
    [stats]
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black overflow-hidden ${className}`}
    >
      {/* Gradient overlay - darker on left, teal on right */}
      {/* <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/50 to-teal-900/30 pointer-events-none" /> */}

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-screen flex items-center">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
          {/* Left Side - Video */}
          <div className="w-full md:w-1/2 flex items-center justify-start md:justify-center -ml-4 md:ml-0 relative z-10">
            <div className="relative w-full max-w-[600px] h-[400px] md:h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-transparent to-transparent blur-3xl opacity-50" />
              <video
                ref={videoRef}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain mix-blend-screen opacity-80"
              />
            </div>
          </div>

          {/* Background Image - Middle Ellipse (above video, below numbers) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="relative w-full h-full max-w-[500px] max-h-[500px] drop-shadow-[0_0_80px_rgba(20,184,166,0.6)]">
              <div className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-full" />
              <Image
                src={middEllipseImg}
                alt="Background"
                fill
                className="object-contain opacity-30 drop-shadow-[0_0_60px_rgba(20,184,166,0.8)]"
                unoptimized
              />
            </div>
          </div>

          {/* Right Side - Statistics Grid */}
          <div className="w-full md:w-1/2 flex items-center justify-center relative z-30">
            <div
              ref={statsRef}
              className="grid grid-cols-2 gap-8 md:gap-12 w-full max-w-[600px]"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col">
                  <div
                    ref={(el) => {
                      numberRefs.current[index] = el;
                    }}
                    className="text-white text-[48px] md:text-[64px] lg:text-[80px] font-[500] leading-none mb-2 md:mb-4"
                  >
                    {stat.number}
                  </div>
                  <div className="text-white text-[14px] md:text-[16px] lg:text-[18px] font-[500] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

