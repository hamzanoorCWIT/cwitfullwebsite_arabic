/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import AiCurvedGallery from "./AiCurvedGallery";
import AiPageReveal from "./AiPageReveal";
import AiFaqList, { type AiFaq } from "./AiFaqList";
import CinematicStoneReveal from "@/app/components/sections/CinematicStoneReveal";
import AiLabShowcase, { type LabSlide } from "./AiLabShowcase";
import styles from "./AiFigmaPage.module.css";

const asset = {
  hero: "/figma-assets/ai-things/e9eb5ec6-fcbf-4427-85b0-4865344e551e.png",
  /* Boulder and the carved slab it becomes, for the hero-to-gallery bridge. */
  stone: "/figma-assets/ai-things/stone.png",
  stoneSlab: "/figma-assets/ai-things/logo-scratch.png",
  trust: [
    "/figma-assets/ai-things/32f67fb6-496c-4e67-b6f5-69453af86f7f.png",
    "/figma-assets/ai-things/a2684f99-2b5a-4bc4-8813-b637cbe0f9fa.png",
    "/figma-assets/ai-things/589123e9-35a0-44c1-b4d4-e914d3921b94.png",
    "/figma-assets/ai-things/c629c227-9415-4d04-be07-c7f2be99bd6e.png",
    "/figma-assets/ai-things/7ded9455-5d84-4276-97ab-4fa07b49ae98.png",
  ],
  industries: {
    orb: "/figma-assets/ai-things/industry-real-estate.png",
    realEstate: "/figma-assets/ai-things/industry-retail.png",
    healthcare: "/figma-assets/ai-things/industry-healthcare.png",
  },
  marquee: [
    "/figma-assets/ai-things/f97b4e34-2b81-49f8-b4a9-1cab82bba8d7.png",
    "/figma-assets/ai-things/b00d3dcc-2c9d-462d-89c8-7e4381cd80e5.png",
    "/figma-assets/ai-things/b7d16d2c-6ad1-47e7-b1cb-1e75074430b5.png",
    "/figma-assets/ai-things/08fea7bc-7dd7-4b88-81c1-f5e03c4d1b52.png",
    "/figma-assets/ai-things/18eadbab-d965-4902-9dbe-7baa96b9bdb4.png",
    "/figma-assets/ai-things/18c38e81-0e34-4b26-aef9-2d438bd74b00.png",
    "/figma-assets/ai-things/a6267f14-06c2-4064-9376-d5a04127ffa9.png",
    "/figma-assets/ai-things/44ddb0bd-554b-4327-b11a-cd9cb9491c3b.png",
    "/figma-assets/ai-things/ed4401cd-c169-4741-a2bd-18d9ac77cbbc.png",
  ],
  footerMark: "/figma-assets/ai-things/footer-mark.svg",
  curveGallery: [
    "/figma-assets/ai-things/ai-things-1.png",
    "/figma-assets/ai-things/ai-things-2.png",
    "/figma-assets/ai-things/ai-things-3.png",
    "/figma-assets/ai-things/ai-things-4.jpg",
    "/figma-assets/ai-things/ai-things-5.jpg",
    "/figma-assets/ai-things/ai-things-6.jpg",
    "/figma-assets/ai-things/ai-things-7.jpg",
    "/figma-assets/ai-things/ai-things-8.jpg",
    "/figma-assets/ai-things/ai-things-9.jpg",
    "/figma-assets/ai-things/ai-things-10.jpg",
  ],
  avatars: [
    "/figma-assets/ai-banner-avatar-1.jpg",
    "/figma-assets/ai-banner-avatar-2.jpg",
    "/figma-assets/ai-banner-avatar-3.jpg",
    "/figma-assets/ai-banner-avatar-4.jpg",
  ],
};

/*
 * Innovation Lab showcase — one entry per scroll step. Step 01 is the frame's
 * campaign set; the later steps are still placeholders.
 */


const labSlides: LabSlide[] = [
  {
    index: "01",
    images: [
      "/figma-assets/ai-things/lab-campaign-1.png",
      "/figma-assets/ai-things/lab-campaign-2.png",
      "/figma-assets/ai-things/lab-campaign-3.png",
    ],
  },
  {
    index: "02",
    images: [
      "/figma-assets/ai-things/ai-things-4.jpg",
      "/figma-assets/ai-things/ai-things-8.jpg",
      "/figma-assets/ai-things/ai-things-10.jpg",
    ],
  },
  {
    index: "03",
    images: [
      "/figma-assets/ai-things/ai-things-1.png",
      "/figma-assets/ai-things/ai-things-2.png",
      "/figma-assets/ai-things/ai-things-3.png",
    ],
  },
];

/*
 * Lines the falling stone shatters on its way through the transition. Each
 * entry is one unbreakable line — the letters are split into spans so they can
 * scatter, which means the browser must not be allowed to choose its own break
 * points. Split the copy here rather than letting it wrap.
 */
const stoneRevealHeadline = ["Transforming", "Businesses With", "Intelligent AI"];

const caseStudies = [
  { title: "Safilo Group – Corporate Digital Platform", image: "case-safilo.png" },
  { title: "Hass — Modern Brand Identity", image: "case-hass.png" },
  { title: "Recycle for Future – Corporate Digital", image: "case-recycle.png" },
];

const metrics = [
  { value: "12+", label: "Years of Market Experience" },
  { value: "30+", label: "In-house Team Members" },
  { value: "99+", label: "Projects Finished" },
];

const faqs: AiFaq[] = [
  {
    question: "Do I need marketing or technical knowledge to use cwit?",
    answer:
      "No. We scope the work with you in plain language, build and run the technical side ourselves, and hand over something your team can operate day to day. Where training helps, it is part of the engagement.",
  },
  {
    question: "Can I use Adly if I already have ad creatives?",
    answer:
      "Yes. Existing creative comes straight in, and we work around what already performs rather than replacing it. Where a format or size is missing we produce it to match what you have.",
  },
  {
    question: "What platforms can I run ads on using Adly?",
    answer:
      "The major paid channels — Meta, Google, LinkedIn, TikTok and programmatic display — from one place, with reporting pulled back into a single view rather than one dashboard per network.",
  },
  {
    question: "Can I connect my online store to Adly?",
    answer:
      "Yes. Shopify, WooCommerce and custom storefronts connect through their own APIs, so catalogue, stock and order data stay in step without anything being exported by hand.",
  },
  {
    question: "Can I promote my website or services with Adly?",
    answer:
      "Yes — it is not limited to product catalogues. Service businesses run lead campaigns, booking flows and content promotion through the same setup, measured on enquiries rather than sales.",
  },
];

const navLinks = ["Home", "Services", "Work", "About", "Contact Us"];
const navHref: Record<string, string> = {
  Home: "/",
  Services: "/services",
  Work: "/portfolio",
  About: "/about",
  "Contact Us": "/contact-us",
};
const serviceLinks = [
  "Website design & Development",
  "AI Automation and Services",
  "Mobile apps development",
  "Web apps development",
  "Branding and Brand strategy",
];

/*
 * Copies of the strip laid end to end. The loop shifts by exactly one copy, so
 * there must be enough of them that the strip still covers the frame at full
 * shift: copies * copyWidth >= widestFrame + copyWidth. Six covers past 4000px.
 * Keep in step with `--marquee-copies` in the stylesheet.
 */
const MARQUEE_COPIES = 6;

function PhoneMarquee() {
  return (
    <div className={styles.phoneMarquee} aria-label="AI interface previews">
      <div className={styles.marqueeTrack}>
        {Array.from({ length: MARQUEE_COPIES }, (_, copy) => (
          <div className={styles.marqueeGroup} key={copy} aria-hidden={copy > 0}>
            {asset.marquee.map((src, index) => (
              // Height comes from the position within the strip, not the DOM, so
              // every copy repeats the same silhouette and the seam disappears.
              <div className={styles.phoneTile} data-variant={index % 4} key={src}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className={styles.phoneFadeLeft} aria-hidden="true" />
      <span className={styles.phoneFadeRight} aria-hidden="true" />
    </div>
  );
}

/*
 * Hand-drawn accents from the reference frame. Inline SVG rather than exported
 * artwork so they stay crisp at any size and scale with the collage stage.
 */
export default function AiFigmaPage() {
  return (
    <main className={styles.page} data-section-theme="light" data-ai-page>
      {/* Entrance reveals for the whole page. Drives the `data-reveal`
          attributes below; adds no markup of its own. */}
      <AiPageReveal root="[data-ai-page]" />

      <section className={styles.hero} data-section-theme="dark" data-reveal-onload>
        <div className={styles.heroBg} aria-hidden="true">
          <img src={asset.hero} alt="" />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <h1 data-reveal>
              Elevate Your
              <br />
              Marketing With
              <br />
              AI Solutions.
            </h1>
            <p className={styles.heroTrust} data-reveal>Trusted by 10k+ businesses</p>
            <div className={styles.heroAvatars} aria-hidden="true" data-reveal>
              {asset.avatars.map((src) => (
                <img src={src} alt="" key={src} />
              ))}
            </div>
          </div>
          <p className={styles.heroDesc} data-reveal>
            <span>Discover how our AI-driven strategies transform your</span>
            <span>marketing, delivering unparalleled results and efficiency.</span>
          </p>
        </div>
      </section>

      <CinematicStoneReveal
        stoneSrc={asset.stone}
        slabSrc={asset.stoneSlab}
        headline={stoneRevealHeadline}
      />

      <section className={styles.buildSmarter} aria-labelledby="build-smarter-title">
        <h2 className={styles.buildSmarterTitle} id="build-smarter-title" data-reveal>
          Build Smarter. Move
          <br />
          Faster. With AI.
        </h2>
        <p className={styles.buildSmarterText} data-reveal>
          <span>We design and build AI-powered solutions that help businesses automate work, improve</span>
          <span>customer experiences, and make better decisions.</span>
        </p>
        <AiCurvedGallery images={asset.curveGallery} />
      </section>

      <section className={styles.results} aria-labelledby="results-title">
        <div className={styles.resultsHeader}>
          <span className={styles.eyebrow} data-reveal>Impact</span>
          <h2 className={`${styles.sectionTitle} ${styles.resultsTitle}`} id="results-title" data-reveal>
            Real Results.
            <br />
            Simple Advertising.
          </h2>
          <p className={styles.resultsText} data-reveal>
            Built for businesses that want results — without learning complex ad tools.
          </p>
        </div>
        <div className={styles.metrics} data-reveal-stagger>
          {metrics.map((item) => (
            <div className={styles.metric} key={item.label}>
              <strong data-count>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.lab} aria-labelledby="lab-title">
        <div className={styles.labIntro} data-section-theme="light">
          <div className={styles.labIntroInner}>
            <h2 className={`${styles.sectionTitle} ${styles.labTitle}`} id="lab-title" data-reveal>
              CWIT Innovation Lab
            </h2>
            <p className={styles.labIntroText} data-reveal>
              Manage everything from creation to optimization with powerful, easy-to-use
              tools designed to save time and drive better results.
            </p>
          </div>
        </div>
        <AiLabShowcase slides={labSlides} />
      </section>

      <section className={styles.cases} aria-labelledby="cases-title">
        <div className={styles.casesHeader}>
          <h2 className={`${styles.sectionTitle} ${styles.casesTitle}`} id="cases-title" data-reveal>
            Built to Think.
            <br />
            Designed to Perform.
          </h2>
          <p className={styles.casesText} data-reveal>
            Explore how we transform complex business challenges into intelligent
            solutions that create measurable, real-world value.
          </p>
          <Link className={styles.button} href="/portfolio" data-reveal>
            Complete Portfolio
          </Link>
        </div>
        <div className={styles.portfolioCards} data-reveal-stagger>
          {caseStudies.map((item, index) => (
            <article className={styles.portfolioCard} key={item.title}>
              <div className={`${styles.portfolioImage} ${index === 2 ? styles.portfolioRecycle : ""}`}>
                <img className={styles.portfolioArtwork} src={`/figma-assets/ai-things/${item.image}`} alt="" loading="lazy" />
                {index === 2 && (
                  <div className={styles.recycleLogo} aria-hidden="true">
                    <img src="/figma-assets/ai-things/case-recycle-symbol.svg" alt="" />
                    <img src="/figma-assets/ai-things/case-recycle-wordmark.svg" alt="" />
                  </div>
                )}
                <span className={styles.portfolioTag}>Corporate Website</span>
              </div>
              <div className={styles.portfolioCaption}><h3>{item.title}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.industries}`} aria-labelledby="industries-title">
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle} id="industries-title" data-reveal>
              Industries We
              <br />
              Empower With AI
            </h2>
            <p className={styles.sectionText} data-reveal>
              Every industry has different challenges. We design AI solutions around the
              workflows, customers, and opportunities that matter most to your business.
            </p>
          </div>
          <Link className={styles.button} href="/contact-us" data-reveal>
            Explore More
          </Link>
        </div>
        {/*
         * The collage is one fixed-aspect stage and every piece is placed in
         * percentages of it, so the whole composition scales as a unit instead
         * of drifting apart the way absolute pixel offsets would.
         */}
        <div
          className={styles.industryArt}
          data-reveal-stagger
          data-reveal-travel="58"
          data-reveal-step="0.13"
          data-reveal-zoom="0.94"
          data-reveal-tilt="5"
        >
          <img className={styles.orb} src={asset.industries.orb} alt="" />
          <img className={styles.realEstate} src={asset.industries.realEstate} alt="" />
          <img className={styles.healthcare} src={asset.industries.healthcare} alt="" />

          <div className={`${styles.industryMark} ${styles.markRealEstate}`}>
            <img className={styles.scribble} src="/figma-assets/ai-things/industry-real-estate-vector.svg" alt="" aria-hidden="true" />
            <span className={styles.industryLabel}>Real Estate</span>
          </div>

          <div className={`${styles.industryMark} ${styles.markHealthcare}`}>
            <img className={styles.scribble} src="/figma-assets/ai-things/industry-healthcare-vector.svg" alt="" aria-hidden="true" />
            <span className={styles.industryLabel}>Healthcare</span>
          </div>

          <span className={`${styles.industryLabel} ${styles.labelRetail}`}>
            Retail &<br />E-Commerce
          </span>
          <img className={styles.scribbleArrows} src="/figma-assets/ai-things/industry-retail-vector.svg" alt="" aria-hidden="true" />
        </div>
      </section>

      <section className={styles.trusted} aria-labelledby="trusted-title">
        <div className={styles.trustedHeader}>
          <span className={styles.eyebrow} data-reveal>Integrations</span>
          <h2 id="trusted-title" data-reveal>Brands That Trust Us</h2>
        </div>
        <div className={styles.trustedLogos} data-reveal-stagger>
          {asset.trust.map((src, index) => (
            <div className={styles.trustedLogo} key={`${src}-${index}`}>
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.faq} aria-labelledby="faq-title">
        <div className={styles.faqLayout}>
          <span className={styles.eyebrow} data-reveal>FAQs</span>
          <div className={styles.faqMain}>
            <h2 className={styles.faqTitle} id="faq-title" data-reveal>
              Frequently Asked
              <br />
              Questions
            </h2>
            <AiFaqList items={faqs} />
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="ai-cta-title">
        <div className={styles.ctaCopy}>
          <h2 className={styles.ctaTitle} id="ai-cta-title" data-reveal>
            Design the Future of AI with CWIT
          </h2>
          <p data-reveal>
            Manage everything from creation to optimization with powerful, easy-to-use
            tools designed to save time and drive better results.
          </p>
        </div>
        <PhoneMarquee />
        <Link className={`${styles.button} ${styles.buttonGreen}`} href="/contact-us" data-reveal>
          Start your journey
        </Link>
      </section>

      <footer className={styles.footer} data-section-theme="dark">
        <div className={styles.footerGrid} data-reveal-stagger>
          <nav className={styles.footerCol} aria-label="Footer navigation">
            {navLinks.map((item) => (
              <Link href={navHref[item]} key={item}>
                {item}
              </Link>
            ))}
          </nav>
          <nav className={styles.footerCol} aria-label="Services">
            {serviceLinks.map((item) => (
              <Link href="/services/ai-and-things" key={item}>
                {item}
              </Link>
            ))}
          </nav>
          <div className={styles.footerCol}>
            <p>Trade Center Area Sheikh Zayed Road Dubai, UAE</p>
            <a className={styles.footerPhone} href="tel:+97141111111">
              <img src="/figma-assets/ai-things/footer-phone.svg" alt="" />
              +971 4 111 111 1
            </a>
            <div className={styles.socials} aria-label="Social links">
              <a className={`${styles.social} ${styles.socialLinkedin}`} href="https://www.linkedin.com/" aria-label="LinkedIn">
                <img src="/figma-assets/ai-things/footer-linkedin.svg" alt="" />
              </a>
              <a className={styles.social} href="https://www.facebook.com/" aria-label="Facebook">
                <img src="/figma-assets/ai-things/footer-facebook.svg" alt="" />
              </a>
            </div>
          </div>
          <div className={styles.footerCol}>
            <p>CWIT © 2025</p>
            <p>All rights reserved</p>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </div>
        <div className={styles.footerMark} aria-hidden="true">
          <img src={asset.footerMark} alt="" />
        </div>
      </footer>
    </main>
  );
}
