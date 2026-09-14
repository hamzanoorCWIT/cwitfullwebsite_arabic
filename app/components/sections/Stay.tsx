import Image from "next/image";
import { splitCmsTextToParagraphs } from "@/app/lib/split-cms-text-to-paragraphs";
import TextSection from "../ui/TextSection";

interface StayProps {
  /** CMS image only — no hardcoded fallback. */
  imageSrc?: string;
  imageAlt?: string;
  paragraphs?: string[];
}

export default function Stay({
  imageSrc,
  imageAlt = "",
  paragraphs = [],
}: StayProps) {
  // Split each WYSIWYG paragraph entry so line breaks / multiple <p> tags render correctly
  const splitParagraphs = paragraphs.flatMap((p) => splitCmsTextToParagraphs(p));
  const hasParagraphs = splitParagraphs.length > 0;
  const cmsImage = imageSrc?.trim() ?? "";
  const hasCmsImage = cmsImage.length > 0;

  if (!hasParagraphs && !hasCmsImage) return null;

  const alt = imageAlt.trim() || "Stay section";

  return (
    <section className="max-w-[1494px] w-full mx-auto relative">
      {/* Desktop: image overlaps upward into previous section */}
      {hasCmsImage ? (
        <>
          <div className="hidden md:block stay-section-image px-4 lg:px-0">
            <Image
              src={cmsImage}
              alt={alt}
              width={1484}
              height={846}
              className="object-cover w-full h-auto"
              unoptimized
            />
          </div>
          <div className="relative w-full md:hidden mb-8">
            <Image
              src={cmsImage}
              alt={alt}
              width={1484}
              height={846}
              className="object-cover w-full h-full"
              unoptimized
            />
          </div>
        </>
      ) : null}

      {/* Text flows naturally below the image — no fixed offsets */}
      {hasParagraphs ? (
        <div className="px-4 md:px-0 stay-section-text py-10 md:py-16">
          <TextSection
            paragraphs={splitParagraphs}
            className="max-w-[1200px] mx-auto text-center"
            firstParagraphClassName="text-[12px] sm:text-[16px] md:text-[40px] lg:text-[40px] xl:text-[40px] 2xl:text-[40px] text-center font-light leading-tight items-center"
          />
        </div>
      ) : null}
    </section>
  );
}
