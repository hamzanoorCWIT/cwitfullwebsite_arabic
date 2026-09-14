import Image from "next/image";
import vectorBg from "@/app/assets/imgs/Mask group (1).png";
import { getProjectInfoRowsForEducation } from "@/app/lib/our-work-api";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";

const headingClass =
  "text-[20px] md:text-[36px] lg:text-[50px] font-regular text-white leading-tight";
const detailClass =
  "text-[12px] sm:text-[14px] md:text-[16px] lg:text-[19px] font-regular text-white/90 mt-1 md:mt-2";

function ProjectInfoBlock({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col">
      {title ? <h2 className={headingClass}>{title}</h2> : null}
      {detail ? (
        <p
          className={detailClass}
          dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(detail) }}
        />
      ) : null}
    </div>
  );
}

interface EducationProps {
  backgroundImageSrc?: string;
  industryTitle?: string;
  industryDescription?: string;
  /** Legacy: ignored when repeater `projectInfoRows` resolves to at least one row. */
  projectTypeTitle?: string;
  projectYear?: string;
  /** ACF repeater from GraphQL (`projectInfoRows`); supports array, `nodes`, snake_case keys. */
  projectInfoRows?: unknown;
  servicesTitle?: string;
  services?: string[];
}

export default function Education({
  backgroundImageSrc,
  industryTitle = "",
  industryDescription = "",
  projectTypeTitle = "",
  projectYear = "",
  projectInfoRows,
  servicesTitle = "",
  services = [],
}: EducationProps) {
  const infoRows = getProjectInfoRowsForEducation(projectInfoRows, projectTypeTitle, projectYear);
  const servicesHeading = servicesTitle.trim() || "";
  const bgSrc = backgroundImageSrc;

  const hasIndustry = !!(industryTitle.trim() || industryDescription.trim());
  /** Cells before Services: one slot for industry (if any) + one per project row */
  const leadCellCount = (hasIndustry ? 1 : 0) + infoRows.length;
  /**
   * 2-column desktop grid: when Industry + N project rows fills an even number of cells,
   * insert an empty cell so Services stays bottom-right (Figma), not under the first column.
   */
  const needsSpacerBeforeServices = leadCellCount > 0 && leadCellCount % 2 === 0;

  return (
    <section className="min-h-[60vh] md:min-h-screen relative">
      {bgSrc ? (
        <>
          <Image
            src={bgSrc}
            alt="Work Details"
            width={1364}
            height={1562}
            className="absolute top-[250px] md:top-[-250px] left-0 hidden md:block"
            unoptimized={!!backgroundImageSrc}
          />
          <Image
            src={bgSrc}
            alt="Work Details"
            width={1364}
            height={1562}
            className="absolute top-0 left-0 md:hidden w-full h-[500px] object-cover"
            unoptimized={!!backgroundImageSrc}
          />
        </>
      ) : null}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-x-12 md:gap-x-16 lg:gap-x-24 gap-y-12 md:gap-y-16 max-w-[1494px] mx-auto py-10 md:py-20 px-10 sm:px-10 md:px-0 education-section items-start"
      >
        {hasIndustry ? (
          <ProjectInfoBlock title={industryTitle} detail={industryDescription} />
        ) : null}
        {infoRows.map((row, i) => (
          <ProjectInfoBlock key={`project-info-${i}`} title={row.title} detail={row.detail} />
        ))}
        {needsSpacerBeforeServices ? (
          <div className="hidden md:block min-h-0" aria-hidden />
        ) : null}
        <div className="w-full">
          {/* <h2 className={headingClass}>{servicesHeading}</h2> */}
          {servicesHeading ? <h2 className={headingClass}>{servicesHeading}</h2> : null}
          {services.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 md:mt-6">
              {services.map((name, i) => (
                <li key={i}>
                  <p className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[19px] font-regular text-white">
                    {name}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
