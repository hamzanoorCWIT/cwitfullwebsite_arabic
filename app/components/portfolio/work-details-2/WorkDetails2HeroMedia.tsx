import WorkDetails2MediaSection from "./WorkDetails2MediaSection";
import styles from "./work-details-2.module.css";

type WorkDetails2HeroMediaProps = {
  videoSrc?: string;
  imageSrc?: string;
  videoSrcMobile?: string;
  imageSrcMobile?: string;
  alt: string;
};

export default function WorkDetails2HeroMedia(props: WorkDetails2HeroMediaProps) {
  return (
    <WorkDetails2MediaSection
      {...props}
      sectionClassName={styles.heroMedia}
      videoClassName={styles.heroVideo}
      ariaLabel="Project hero media"
      priority
    />
  );
}
