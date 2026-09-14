"use client";

import Image from "next/image";
import CallToActionButton from "../ui/CallToActionButton";
import phoneIcon from "@/app/assets/imgs/phone.png";
import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FooterSettings } from "@/app/lib/site-settings-api";
import { USE_COMPACT_FOOTER, USE_LEGACY_FOOTER } from "./footer-config";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Footer({ settings }: { settings?: FooterSettings }) {
  const footerRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const ctaHeadingRef = useRef<HTMLHeadingElement>(null);
  const ctaParagraphRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const linksSectionRef = useRef<HTMLDivElement>(null);
  const linksColumnsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const footerCtaHeading = settings?.ctaHeading?.trim() ?? "";
  const footerCtaParagraph = settings?.ctaParagraph?.trim() ?? "";
  const footerCtaButtonText = settings?.ctaButtonText?.trim() ?? "";
  const footerCtaButtonLink = settings?.ctaButtonLink?.trim() ?? "";
  const navigationLinks = settings?.navigationLinks ?? [];
  const serviceLinks = settings?.serviceLinks ?? [];
  const addressLines = settings?.addressLines ?? [];
  const footerPhone = settings?.phone?.trim() || "971588279426";
  const socialLinks = settings?.socialLinks ?? [];
  const copyrightLineOne = settings?.copyrightLineOne?.trim() ?? "";
  const copyrightLineTwo = settings?.copyrightLineTwo?.trim() ?? "";
  const privacyLabel = settings?.privacyLabel?.trim() ?? "";
  const privacyLink = settings?.privacyLink?.trim() ?? "";
  const termsLabel = settings?.termsLabel?.trim() ?? "";
  const termsLink = settings?.termsLink?.trim() ?? "";

  const footerBgSrc = settings?.ctaBackgroundImageSrc?.trim() ?? "";
  const footerBgAlt = settings?.ctaBackgroundImageAlt?.trim() ?? "";
  const footerOverlayRgba = settings?.ctaBackgroundOverlayRgba?.trim() ?? "";

  const showLegacyFooterCta =
    USE_LEGACY_FOOTER &&
    !USE_COMPACT_FOOTER &&
    !!(footerCtaHeading || footerCtaParagraph || (footerCtaButtonText && footerCtaButtonLink));

  function renderSocialIcon(iconSrc: string, iconAlt: string) {
    const unoptimized =
      iconSrc.startsWith("http") ||
      iconSrc.startsWith("/wp-content") ||
      /\.svg(\?|$)/i.test(iconSrc);

    return (
      <Image
        src={iconSrc}
        alt={iconAlt}
        width={17}
        height={15}
        className="footer-social-icon-img"
        unoptimized={unoptimized}
      />
    );
  }

  useEffect(() => {
    if (!footerRef.current || !ctaSectionRef.current) return;
    const ctaSection = ctaSectionRef.current;
    const linksSection = linksSectionRef.current;

    // Kill existing ScrollTriggers
    ScrollTrigger.getAll().forEach((trigger) => {
      if (
        trigger.trigger === ctaSection ||
        trigger.trigger === linksSection
      ) {
        trigger.kill();
      }
    });

    // Legacy CTA section animations (only when legacy footer CTA is rendered)
    const ctaHeading = ctaHeadingRef.current;
    const ctaParagraph = ctaParagraphRef.current;
    const ctaButton = ctaButtonRef.current;

    if (showLegacyFooterCta && ctaHeading && ctaParagraph && ctaButton) {
      gsap.set([ctaHeading, ctaParagraph, ctaButton], { opacity: 0, y: 50 });

      const checkIfInView = () => {
        const rect = ctaSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        return rect.top < windowHeight * 0.8 && rect.bottom > 0;
      };

      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          onEnter: () => {
            ctaTl.play();
          },
          onEnterBack: () => {
            ctaTl.play();
          },
        },
      });

      ctaTl
        .to(ctaHeading, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        })
        .to(ctaParagraph, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }, "+=0.2")
        .to(ctaButton, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }, "+=0.2");

      if (checkIfInView()) {
        setTimeout(() => {
          ctaTl.play();
        }, 100);
      }
    }

    // Footer Links Section Animations
    const linksColumns = linksColumnsRef.current;
    if (linksColumns && linksSection) {
      const columns = linksColumns.querySelectorAll('.footer-column');

      gsap.set(columns, { opacity: 0, y: 60 });

      const checkIfInView = () => {
        const rect = linksSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        return rect.top < windowHeight * 0.85 && rect.bottom > 0;
      };

      const linksTl = gsap.timeline({
        scrollTrigger: {
          trigger: linksSection,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          onEnter: () => {
            linksTl.play();
          },
          onEnterBack: () => {
            linksTl.play();
          },
        },
      });

      linksTl.to(columns, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
      });

      if (checkIfInView()) {
        setTimeout(() => {
          linksTl.play();
        }, 100);
      }
    }

    ScrollTrigger.refresh();

    return () => {
      const triggers = ScrollTrigger.getAll();
      triggers.forEach((trigger) => {
        if (
          trigger.trigger === ctaSection ||
          trigger.trigger === linksSection
        ) {
          trigger.kill();
        }
      });
    };
  }, [pathname, showLegacyFooterCta]);

  const sectionClassName = USE_COMPACT_FOOTER
    ? "footer-new-home-section"
  /* Legacy: tall footer with CTA area */
    : "md:h-[1223px] h-[1023px] md:min-h-[1223px] min-h-[800px]";

  const linksSectionPositionClass = USE_COMPACT_FOOTER
    ? "relative"
  /* Legacy: links overlaid on vector/background */
    : "absolute bottom-0 left-0 right-0";

  const linksSectionBgClass = USE_COMPACT_FOOTER
    ? "bg-black"
  /* Legacy: semi-transparent overlay over footer background image */
    : "bg-black/10";

  return (
    <footer
      ref={footerRef}
      className={`relative bg-black text-white footer-responsive${USE_COMPACT_FOOTER ? " footer-new-home" : ""}`}
    >
      <section
        ref={ctaSectionRef}
        className={`relative overflow-hidden footer-section bg-black ${sectionClassName}`}
        style={{
          width: "1920px",
          maxWidth: "100%",
          margin: "0 auto",
        }}
      >
        {/* Legacy footer background image — restore with USE_LEGACY_FOOTER */}
        {USE_LEGACY_FOOTER && !USE_COMPACT_FOOTER && footerBgSrc ? (
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src={footerBgSrc}
              alt={footerBgAlt || "Footer background"}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized={
                footerBgSrc.startsWith("http") || /\.svg(\?|$)/i.test(footerBgSrc)
              }
            />
          </div>
        ) : null}

        {/* Legacy footer overlay — restore with USE_LEGACY_FOOTER */}
        {USE_LEGACY_FOOTER && !USE_COMPACT_FOOTER && footerOverlayRgba ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ backgroundColor: footerOverlayRgba }}
            aria-hidden
          />
        ) : null}

        {/* Legacy footer CTA block — restore with USE_LEGACY_FOOTER */}
        {USE_LEGACY_FOOTER && !USE_COMPACT_FOOTER ? (
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 footer-cta-content md:top-[-150px]">
            {showLegacyFooterCta && (
              <>
                {footerCtaHeading ? (
                  <h2 ref={ctaHeadingRef} className="text-[60px] md:text-[80px] font-[700] leading-[80px] text-white mb-4 footer-heading">
                    {footerCtaHeading}
                  </h2>
                ) : null}
                {footerCtaParagraph ? (
                  <p ref={ctaParagraphRef} className="text-[16px] md:text-[20px] text-white mb-8 max-w-2xl footer-paragraph">
                    {footerCtaParagraph}
                  </p>
                ) : null}
                {footerCtaButtonText && footerCtaButtonLink ? (
                  <div ref={ctaButtonRef}>
                    <CallToActionButton
                      variant="shiny"
                      onClick={() => router.push(footerCtaButtonLink)}
                    >
                      {footerCtaButtonText}
                    </CallToActionButton>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        <div
          ref={linksSectionRef}
          className={`${linksSectionPositionClass} z-20 ${linksSectionBgClass} footer-links-section global-section-padding-footer pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-16 lg:pb-16 xl:pt-20 xl:pb-20 2xl:pt-22 2xl:pb-22`}
        >
          <div className="flex justify-center items-center mx-auto footer-links-container global-section-padding px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
            <div ref={linksColumnsRef} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10 lg:gap-10 xl:gap-12 2xl:gap-14 footer-links-grid w-full">
              {navigationLinks.length > 0 ? (
                <div className="footer-column footer-column-nav flex flex-col items-start">
                  <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 xl:space-y-4 font-graphik-light-weight-300">
                    {navigationLinks.map((item, index) => (
                      <li key={`${item.label}-${index}`}>
                        {item.href?.trim() ? (
                          <a
                            href={item.href.trim()}
                            className="text-white hover:text-[#0DFCC1] transition-colors footer-link"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="text-white footer-link">
                            {item.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {serviceLinks.length > 0 ? (
                <div className="footer-column footer-column-services flex flex-col items-start">
                  <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 xl:space-y-4 font-graphik-light-weight-300">
                    {serviceLinks.map((item, index) => (
                      <li key={`${item.label}-${index}`}>
                        {item.href?.trim() ? (
                          <a
                            href={item.href.trim()}
                            className="text-white hover:text-[#0DFCC1] transition-colors footer-link"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="text-white footer-link">
                            {item.label}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {(addressLines.length > 0 ||
                footerPhone ||
                socialLinks.length > 0) ? (
              <div className="footer-column footer-column-contact flex flex-col justify-center items-start md:items-start lg:items-start footer-contact-info mt-4 sm:mt-0">
                <ul className="font-graphik-light-weight-300 space-y-1.5 sm:space-y-2 md:space-y-2.5 lg:space-y-3">
                  {addressLines.map((line, index) => (
                    <li
                      key={`${line}-${index}`}
                      className={`text-white footer-text ${index === addressLines.length - 1 ? "mb-3 sm:mb-3.5 md:mb-4 lg:mb-4.5 xl:mb-5" : ""}`}
                    >
                      {line}
                    </li>
                  ))}
                  {footerPhone ? (
                    <li className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-white">
                      <Image
                        src={phoneIcon}
                        alt="Phone"
                        width={16.66}
                        height={16.66}
                        className="footer-phone-icon shrink-0"
                      />
                      <a href={`tel:${footerPhone.replace(/\s/g, "")}`} className="footer-phone-text hover:text-[#0DFCC1] transition-colors">
                        {footerPhone}
                      </a>
                    </li>
                  ) : null}
                </ul>

                {socialLinks.length > 0 ? (
                  <div className="footer-social-wrap">
                    <div className="flex justify-start items-start footer-social-list">
                      {socialLinks.map((item, index) => (
                        <a
                          key={`${item.label}-${index}`}
                          href={item.href}
                          className="rounded-full border border-white flex items-center justify-center text-white hover:bg-[#0DFCC1] hover:border-[#0DFCC1] transition-colors footer-social-icon"
                          aria-label={item.label}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {renderSocialIcon(item.iconSrc, item.iconAlt)}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              ) : null}

              {(copyrightLineOne ||
                copyrightLineTwo ||
                (privacyLabel && privacyLink) ||
                (termsLabel && termsLink)) ? (
                <div className="footer-column footer-column-copyright flex flex-col justify-start md:justify-start lg:justify-center items-start md:items-start lg:items-end footer-copyright mt-4 sm:mt-0">
                  <ul className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 xl:space-y-4 font-graphik-light-weight-300">
                    {copyrightLineOne ? (
                      <li className="text-white footer-text">
                        {copyrightLineOne}
                      </li>
                    ) : null}
                    {copyrightLineTwo ? (
                      <li className="text-white footer-text">
                        {copyrightLineTwo}
                      </li>
                    ) : null}
                    {privacyLabel && privacyLink ? (
                      <li>
                        <a href={privacyLink} className="text-white hover:text-[#0DFCC1] transition-colors footer-link">
                          {privacyLabel}
                        </a>
                      </li>
                    ) : null}
                    {termsLabel && termsLink ? (
                      <li>
                        <a href={termsLink} className="text-white hover:text-[#0DFCC1] transition-colors footer-link">
                          {termsLabel}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
