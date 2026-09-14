"use client";

import CallToActionButton from "@/app/components/ui/CallToActionButton";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { splitCmsTextToParagraphs } from "@/app/lib/split-cms-text-to-paragraphs";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface StudioItem {
  title: string;
  description: string;
  video: string;
  href: string;
  buttonText?: string;
}

interface StudiosProps {
  studios?: StudioItem[];
}

const STUDIO_INDICES = [0, 1, 2] as const;

export default function Studios({ studios: studiosProp }: StudiosProps = {}) {
  const fromCms = studiosProp?.length ? studiosProp.slice(0, 3) : [];
  const studios: StudioItem[] = fromCms.length > 0
    ? fromCms.map((cms) => ({
        title: cms.title?.trim() || "",
        description: cms.description?.trim() || "",
        video: (cms.video ?? "").trim(),
        href: (cms.href ?? "").trim(),
        buttonText: cms.buttonText?.trim() || undefined,
      }))
    : [];
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const divRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const getStudio = (index: number): StudioItem =>
    studios[index] ?? { title: "", description: "", video: "", href: "" };

  const navigateToStudio = (href: string) => {
    const h = href.trim();
    if (!h || h === "#") return;
    if (/^https?:\/\//i.test(h)) {
      window.location.assign(h);
      return;
    }
    router.push(h.startsWith("/") ? h : `/${h.replace(/^\/+/, "")}`);
  };

  if (studios.length === 0) return null;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const container = section.querySelector("[data-studios-container]");
    if (!container) return;

    const div1Ref = container.querySelector("[data-studio-index='0']") as HTMLDivElement | null;
    const div2Ref = container.querySelector("[data-studio-index='1']") as HTMLDivElement | null;
    const div3Ref = container.querySelector("[data-studio-index='2']") as HTMLDivElement | null;

    if (!div1Ref || !div2Ref || !div3Ref) return;

    const video1 = div1Ref.querySelector("video");
    const video2 = div2Ref.querySelector("video");
    const video3 = div3Ref.querySelector("video");
    const content1 = div1Ref.querySelector(".content-wrapper");
    const content2 = div2Ref.querySelector(".content-wrapper");
    const content3 = div3Ref.querySelector(".content-wrapper");

    // Stacking: visible card must be on top so content and click match. Use z-index.
    gsap.set(div1Ref, { opacity: 1, pointerEvents: "auto", visibility: "visible", zIndex: 10 });
    gsap.set(div2Ref, { opacity: 0, pointerEvents: "none", visibility: "visible", zIndex: 0 });
    gsap.set(div3Ref, { opacity: 0, pointerEvents: "none", visibility: "visible", zIndex: 0 });
    gsap.set([video1, content1].filter(Boolean), { scale: 1, opacity: 1, visibility: "visible" });
    gsap.set([video2, video3, content2, content3].filter(Boolean), { scale: 0.3, opacity: 1, visibility: "visible" });

    const viewportHeight = window.innerHeight;
    const endValue = viewportHeight * 2.0;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${endValue}px`,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Studio 0: fade out, put behind
    tl.to(div1Ref, { opacity: 0, pointerEvents: "none", zIndex: 0, duration: 0.5, ease: "power2.inOut", force3D: true }, 0.3);
    tl.to([video1, content1].filter(Boolean), { scale: 0.3, duration: 0.5, ease: "power2.inOut", force3D: true }, 0.3);

    // Studio 1: bring on top, fade in
    tl.to(div2Ref, { zIndex: 10 }, 0.75);
    tl.fromTo(div2Ref, { opacity: 0, pointerEvents: "none", force3D: true }, { opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power2.inOut", force3D: true }, 0.8);
    tl.fromTo([video2, content2].filter(Boolean), { scale: 0.3, force3D: true }, { scale: 1, duration: 0.5, ease: "power2.inOut", force3D: true }, 0.8);
    tl.to(div2Ref, { opacity: 0, pointerEvents: "none", zIndex: 0, duration: 0.5, ease: "power2.inOut", force3D: true }, 1.5);
    tl.to([video2, content2].filter(Boolean), { scale: 0.3, duration: 0.5, ease: "power2.inOut", force3D: true }, 1.5);

    // Studio 2 (index 2): bring on top, fade in – ensure third card visible
    tl.to(div3Ref, { zIndex: 10 }, 1.95);
    tl.fromTo(div3Ref, { opacity: 0, pointerEvents: "none", force3D: true }, { opacity: 1, pointerEvents: "auto", duration: 0.5, ease: "power2.inOut", force3D: true }, 2.0);
    tl.fromTo([video3, content3].filter(Boolean), { scale: 0.3, force3D: true }, { scale: 1, duration: 0.5, ease: "power2.inOut", force3D: true }, 2.0);
    tl.to(div3Ref, { opacity: 0, pointerEvents: "none", zIndex: 0, duration: 0.5, ease: "power2.inOut", force3D: true }, 2.7);
    tl.to([video3, content3].filter(Boolean), { scale: 0.3, duration: 0.5, ease: "power2.inOut", force3D: true }, 2.7);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      tl.scrollTrigger?.kill(true);
      tl.kill();
    };
  }, [studios.length]);

  return (
    <section ref={sectionRef} className="relative bg-black pt-24 overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background Image - Right Side - Hidden temporarily */}
      {/* <div
        ref={imageRef}
        style={{
          margin: '0 auto',
          willChange: 'transform',
        }}
        className="w-[1920px] max-w-full left-0 md:left-[700px] absolute right-0 top-0 bottom-0 w-1/2 z-10">
        <Image
          src={maskGroupImg}
          alt="Background"
          className="object-cover object-right h-[452px] md:h-[1562px] mask-studio-image"
          unoptimized
        />
      </div> */}

      <div className="relative z-1 w-full h-screen flex items-center justify-center">
        <div
          ref={containerRef}
          data-studios-container
          className="relative w-full h-screen"
        >
          {STUDIO_INDICES.map((index) => {
            const studio = getStudio(index);
            const descriptionParagraphs = splitCmsTextToParagraphs(studio.description);
            const divRef = divRefs[index];
            return (
              <div
                ref={divRef}
                key={index}
                data-studio-index={index}
                className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full"
                style={{ willChange: 'opacity' }}
              >
                <div className={`relative flex flex-col items-start max-w-[1400px] ps-3 pe-3 md:ps-38 md:mt-[-140px] ${index === 1 ? "mx-auto" : index === 2 ? "ms-auto" : ""}`}>
                  {/* Video positions use inline-start so they flip in RTL */}
                  {studio.video ? (
                    <video
                      src={studio.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={`absolute inset-0 object-cover mx-auto video-responsive-studios video-studio-${index}`}
                      style={{
                        insetInlineStart: index === 0 ? "150px" : index === 1 ? "774px" : index === 2 ? "-650px" : "100px",
                        top: index === 0 ? "-190px" : index === 1 ? "-100px" : index === 2 ? "-20px" : "-150px",
                        width: index === 0 ? "720px" : index === 1 ? "461px" : index === 2 ? "420px" : "420px",
                        height: index === 0 ? "405px" : index === 1 ? "461px" : index === 2 ? "420px" : "420px",
                        zIndex: -1000,
                      }}
                    />
                  ) : null}

                  {/* Content aligns to inline-start (right in RTL) */}
                  <div className={`content-wrapper relative z-20 w-full ${index === 0 ? "ps-0 lg:ps-8 lg:pt-0 content-studio-0" : index === 1 ? "ps-0 lg:ps-26 content-studio-1" : index === 2 ? "ps-0 lg:ps-100 content-studio-2" : "ps-0"}`}>
                    <h2 className={`${SECTION_HEADING_CLASS} studios-section-title text-white`}>
                      {index === 0 ? (
                        (() => {
                          const t = studio.title || "";
                          const first = t.split(" ")[0] || "";
                          const second = t.split(" ").slice(1).join(" ") || "";
                          return <>{first}<br />{second}</>;
                        })()
                      ) : index === 1 ? (
                        (() => {
                          const t = studio.title || "";
                          const first = t.split(" ")[0] || "";
                          const second = t.split(" ").slice(1).join(" ") || "";
                          return <>{first}<br />{second}</>;
                        })()
                      ) : index === 2 ? (
                        (() => {
                          const t = studio.title || "";
                          const first = t.startsWith("Growth &") ? "Growth &" : t.split(" ")[0] || "";
                          const second = t.startsWith("Growth &") ? t.slice(8).trim() : t.split(" ").slice(1).join(" ") || "";
                          return <>{first}<br />{second}</>;
                        })()
                      ) : (
                        studio.title || ""
                      )}
                    </h2>
                    {descriptionParagraphs.length > 0 ? (
                      <div className="py-8 max-w-[730px] space-y-4">
                        {descriptionParagraphs.map((para, i) => (
                          <p
                            key={i}
                            className="text-[16px] md:text-[18px] text-white leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(para) }}
                          />
                        ))}
                      </div>
                    ) : null}
                    {studio.buttonText?.trim() && studio.href?.trim() ? (
                      <CallToActionButton
                        variant="shiny"
                        onClick={() => navigateToStudio(studio.href)}
                      >
                        {studio.buttonText.trim()}
                      </CallToActionButton>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

