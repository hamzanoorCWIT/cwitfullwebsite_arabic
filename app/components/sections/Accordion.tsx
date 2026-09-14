"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface AccordionItem {
  id: number;
  title: string;
  content: string;
}

interface AccordionProps {
  /** Section heading */
  title?: string;
  /** FAQ items from CMS */
  items?: AccordionItem[];
  className?: string;
  titleClassName?: string;
}

export default function Accordion({
  title = "",
  items,
  className = "",
  titleClassName = "",
}: AccordionProps) {
  const accordionItems = items ?? [];
  const firstItemId = accordionItems[0]?.id ?? 1;
  const [openItems, setOpenItems] = useState<number[]>([firstItemId]); // First item expanded by default
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const plusIconRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const minusIconRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const toggleItem = (id: number) => {
    const contentEl = contentRefs.current[id];
    const plusIconEl = plusIconRefs.current[id];
    const minusIconEl = minusIconRefs.current[id];

    if (!contentEl || !plusIconEl || !minusIconEl) return;

    const isOpen = openItems.includes(id);

    if (isOpen) {
      // Close animation
      gsap.to(contentEl, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          contentEl.style.display = "none";
        },
      });

      // Hide minus, show plus
      gsap.to(minusIconEl, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          minusIconEl.style.display = "none";
          plusIconEl.style.display = "flex";
          gsap.to(plusIconEl, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.inOut",
          });
        },
      });

      setOpenItems(openItems.filter((itemId) => itemId !== id));
    } else {
      // Open animation
      contentEl.style.display = "block";

      // Get natural height
      const height = contentEl.scrollHeight;
      contentEl.style.height = "0px";
      contentEl.style.opacity = "0";

      gsap.to(contentEl, {
        height: height,
        opacity: 1,
        duration: 0.4,
        ease: "power2.inOut",
      });

      // Hide plus, show minus
      gsap.to(plusIconEl, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          plusIconEl.style.display = "none";
          minusIconEl.style.display = "flex";
          gsap.to(minusIconEl, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.inOut",
          });
        },
      });

      setOpenItems([...openItems, id]);
    }
  };

  // Initialize state - first item open, others closed
  useGSAP(() => {
    Object.keys(contentRefs.current).forEach((key) => {
      const id = Number(key);
      const el = contentRefs.current[id];
      const plusIconEl = plusIconRefs.current[id];
      const minusIconEl = minusIconRefs.current[id];

      if (el) {
        if (id === firstItemId) {
          // First item: keep it open
          el.style.display = "block";
          el.style.height = "auto";
          el.style.opacity = "1";

          // Set icons for first item
          if (plusIconEl) {
            plusIconEl.style.display = "none";
            plusIconEl.style.opacity = "0";
          }
          if (minusIconEl) {
            minusIconEl.style.display = "flex";
            minusIconEl.style.opacity = "1";
          }
        } else {
          // Other items: keep them closed
          el.style.height = "0px";
          el.style.opacity = "0";
          el.style.display = "none";

          // Set icons for other items
          if (plusIconEl) {
            plusIconEl.style.display = "flex";
            plusIconEl.style.opacity = "1";
          }
          if (minusIconEl) {
            minusIconEl.style.display = "none";
            minusIconEl.style.opacity = "0";
          }
        }
      }
    });
  });

  // ScrollTrigger animations for section entrance (re-runs when items change so CMS content is animated)
  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !itemsContainerRef.current) return;

    const title = titleRef.current;
    const accordionItemEls = itemsContainerRef.current.querySelectorAll('.accordion-item');

    // Set initial state
    gsap.set(title, { opacity: 0, y: 50 });
    gsap.set(accordionItemEls, { opacity: 0, y: 60, scale: 0.95 });

    const triggerEl = sectionRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerEl,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
      },
    });

    tl.to(title, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
    }).to(accordionItemEls, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out",
      stagger: accordionItemEls.length > 0 ? Math.min(0.2, 0.6 / accordionItemEls.length) : 0.2,
    }, "-=0.4");

    const alreadyInView = () => {
      if (!triggerEl) return false;
      const rect = triggerEl.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
    };
    if (alreadyInView()) {
      setTimeout(() => tl.play(), 50);
    }

    ScrollTrigger.refresh();

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === triggerEl) st.kill();
      });
    };
  }, [items?.length ?? 0]);

  if (!accordionItems.length) return null;

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black py-24 overflow-hidden ${className}`}
    >
      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding accordion-content-container">
        <h2
          ref={titleRef}
          className={
            titleClassName ||
            `${SECTION_HEADING_CLASS} text-white mb-8 sm:mb-10 md:mb-12 lg:mb-14`
          }
        >
          {title}
        </h2>

        <div ref={itemsContainerRef} className="space-y-3">
          {accordionItems.map((item) => {
            const isOpen = openItems.includes(item.id);

            return (
              <div
                key={item.id}
                className={`accordion-item overflow-hidden rounded-[10px] ${isOpen ? 'rounded-[10px] border border-[#0DFCC1]' : 'border-0'}`}
              >
                {/* Accordion Header - Dark Grey Rectangle */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-5 text-start border border-[#4E4E4E] transition-colors duration-300 ${isOpen ? 'rounded-t-[10px] rounded-b-none' : 'rounded-[10px]'}`}
                >
                  <h3 className={`text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[19px] min-[1440px]:text-[20px] min-[1920px]:text-[22px] pe-8 accordion-title ${isOpen ? 'text-white font-bold' : 'text-white font-medium'}`}>
                    {item.title}
                  </h3>

                  {/* Plus Icon */}
                  <div
                    ref={(el) => {
                      plusIconRefs.current[item.id] = el;
                    }}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                    style={{ display: isOpen ? 'none' : 'flex', opacity: isOpen ? 0 : 1 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>

                  {/* Minus Icon */}
                  <div
                    ref={(el) => {
                      minusIconRefs.current[item.id] = el;
                    }}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center"
                    style={{ display: isOpen ? 'flex' : 'none', opacity: isOpen ? 1 : 0 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M20 12H4"
                      />
                    </svg>
                  </div>
                </button>

                {/* Accordion Content */}
                <div
                  ref={(el) => {
                    contentRefs.current[item.id] = el;
                  }}
                  className="overflow-hidden"
                  style={item.id === firstItemId ? { display: 'block', height: 'auto', opacity: 1 } : { display: 'none', height: '0px', opacity: 0 }}
                >
                  <div className={`p-6 ${isOpen ? 'rounded-b-[10px]' : 'bg-black'}`}>
                    <div
                      className="text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] 2xl:text-[17px] min-[1440px]:text-[18px] min-[1920px]:text-[18px] text-white leading-[1.5] sm:leading-[1.55] md:leading-[1.6] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] accordion-content prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: normalizeDescriptionHtml(item.content || ""),
                      }}
                    />
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

