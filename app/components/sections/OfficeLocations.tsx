"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface OfficeLocation {
  city: string;
  address: string[];
  email: string;
  phone: string;
}

interface OfficeLocationsProps {
  className?: string;
  offices?: OfficeLocation[];
  variant?: "default" | "menu";
}

export default function OfficeLocations({
  className = "",
  offices,
  variant = "default",
}: OfficeLocationsProps) {
  if (!offices || offices.length === 0) return null;
  const isMenu = variant === "menu";
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current || isMenu) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate each office card with stagger effect
      cardRefs.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, { opacity: 0, y: 50 });
          tl.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          }, index === 0 ? 0 : "<0.15");
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isMenu]);

  return (
    <section
      ref={sectionRef}
      className={`bg-transparent text-white ${
        isMenu ? "menu-modal-offices h-auto py-0" : "py-16 md:py-24 h-full flex items-center"
      } ${className}`}
    >
      <div className="max-w-[1294px] mx-auto office-locations-container w-full">
        <div className="office-locations-grid">
          {offices.map((office, index) => (
            <div
              key={index}
              ref={(el) => { cardRefs.current[index] = el; }}
              className="flex flex-col items-center office-location-card"
            >
              <h3 className="office-location-heading font-[300] mb-2 text-white text-center">
                {office.city}
              </h3>
              <div className="flex flex-col items-center text-center">
                {office.address.map((line, lineIndex) => (
                  <p
                    key={lineIndex}
                    className="office-location-text text-white font-[300]"
                  >
                    {line}
                  </p>
                ))}
                <a
                  href={`mailto:${office.email}`}
                  className="block office-location-text text-white font-[300] hover:text-[#0DFCC1] transition-colors"
                >
                  {office.email}
                </a>
                <a
                  href={`tel:${office.phone.replace(/\s/g, "")}`}
                  className="block office-location-text text-white font-[300] hover:text-[#0DFCC1] transition-colors"
                >
                  {office.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
