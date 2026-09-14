"use client";

import Image from "next/image";
import Link from "next/link";
import { forwardRef } from "react";
import type { OurWorkPageItem } from "@/app/our-work/our-work-types";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { tooltipFromHtml } from "@/app/lib/tooltip-from-html";
import { normalizePortfolioDetailHref } from "@/app/lib/portfolio-url";
import styles from "./our-work-project-grid.module.css";

function getPortfolioUrl(workItemLink: string | undefined): string {
  return normalizePortfolioDetailHref(workItemLink);
}

function getCategoryLines(category: string | undefined): string[] {
  if (!category?.trim()) return [];

  const normalized = category
    .replace(/&lt;br\s*\/?&gt;/gi, "\n")
    .replace(/\\n/g, "\n")
    .replace(/&#10;|&#x0*a;/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<\/?(p|div|span)\b[^>]*>/gi, "");

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  const words = (lines[0] ?? "").split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.length <= 3) {
    return [words[0], words.slice(1).join(" ")].filter(Boolean);
  }

  return lines;
}

type OurWorkProjectGridProps = {
  items: OurWorkPageItem[];
};

const OurWorkProjectGrid = forwardRef<HTMLElement, OurWorkProjectGridProps>(function OurWorkProjectGrid(
  { items },
  sectionRef
) {
  if (!items.length) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Selected projects"
    >
      <div className={styles.grid}>
        {items.map((item, index) => {
          const href = getPortfolioUrl(item.link);
          const imageSrc =
            typeof item.image === "string"
              ? item.image.trim()
              : item.image?.src?.trim() || "";
          const slugKey = item.link?.replace(/^\//, "") || `work-${index}`;
          const categoryLines = getCategoryLines(item.category);
          const descriptionHtml = normalizeDescriptionHtml(item.description ?? "");

          return (
            <article key={slugKey} className={`${styles.projectItem} our-work-project-item`}>
              <Link href={href} className={styles.projectLink}>
                <div className={`${styles.projectCard} work-card`}>
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 760px) calc(100vw - 32px), 47vw"
                      priority={index < 2}
                      unoptimized={typeof item.image === "string"}
                    />
                  ) : (
                    <span className={styles.imagePlaceholder} aria-hidden />
                  )}
                </div>
                <div className={styles.projectMeta}>
                  {categoryLines.map((line) => (
                    <span key={line} className={styles.categoryLine}>
                      {line}
                    </span>
                  ))}
                  <h2
                    className={styles.projectTitle}
                    title={tooltipFromHtml(item.title)}
                  >
                    {item.title}
                  </h2>
                  {descriptionHtml ? (
                    <div
                      className={`${styles.projectDescription} our-work-description`}
                      title={tooltipFromHtml(descriptionHtml)}
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  ) : null}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
});

export default OurWorkProjectGrid;
