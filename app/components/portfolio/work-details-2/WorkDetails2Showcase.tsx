"use client";

import HorizontalScrollSlider, {
  type SliderCard,
} from "@/app/components/ui/HorizontalScrollSlider";
import styles from "./work-details-2.module.css";

type WorkDetails2ShowcaseProps = {
  cards: SliderCard[];
};

export default function WorkDetails2Showcase({ cards }: WorkDetails2ShowcaseProps) {
  if (!cards.length) return null;

  return (
    <section className={styles.showcaseSection} aria-label="Project showcase">
      <div className={styles.showcaseSlider}>
        <div className={styles.showcaseCards}>
          <HorizontalScrollSlider
            cards={cards}
            cardClassName={styles.showcaseCard}
            trackClassName={styles.showcaseTrack}
          />
        </div>
      </div>
    </section>
  );
}
