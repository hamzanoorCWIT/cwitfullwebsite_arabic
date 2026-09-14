import CallToActionButton from "../ui/CallToActionButton";
import FigmaHomeClientLogos from "./FigmaHomeClientLogos";
import FigmaHomeOffersCarousel from "./FigmaHomeOffersCarousel";
import FigmaHomeTestimonials from "./FigmaHomeTestimonials";
import headingStyles from "./FigmaHomeSectionTitle.module.css";
import styles from "./FigmaHomeOffers.module.css";
import type { HomeClientLogo, HomeTestimonialItem } from "@/app/lib/home-normalize";
import type { HomeOffersData } from "@/app/lib/home-offers-types";

type FigmaHomeOffersProps = {
  offers: HomeOffersData;
  clientLogos?: HomeClientLogo[];
  testimonials?: HomeTestimonialItem[];
};

export default function FigmaHomeOffers({
  offers,
  clientLogos,
  testimonials,
}: FigmaHomeOffersProps) {
  const hasOffers = offers.columns.some((column) => column.length > 0);

  return (
    <section
      className={styles.offers}
      aria-labelledby={
        hasOffers && offers.heading ? "new-home-offers-title" : undefined
      }
      data-section-theme="light"
    >
      {hasOffers ? (
        <>
          <div className={styles.offerHeader}>
            <div>
              {offers.heading ? (
                <h2
                  id="new-home-offers-title"
                  className={headingStyles.heading}
                >
                  {offers.heading}
                </h2>
              ) : null}
              {offers.description ? <p>{offers.description}</p> : null}
            </div>
            {offers.ctaText && offers.ctaLink ? (
              <CallToActionButton
                variant="shiny"
                href={offers.ctaLink}
                className={`${styles.offerCta} !w-auto !min-w-[200px] sm:!min-w-[221px] whitespace-nowrap`}
              >
                {offers.ctaText}
              </CallToActionButton>
            ) : null}
          </div>

          <FigmaHomeOffersCarousel columns={offers.columns} />
        </>
      ) : null}

      <FigmaHomeTestimonials testimonials={testimonials} />

      <FigmaHomeClientLogos logos={clientLogos} />
    </section>
  );
}
