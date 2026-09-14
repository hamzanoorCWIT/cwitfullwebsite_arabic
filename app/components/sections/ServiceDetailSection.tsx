"use client";

import CallToActionButton from "@/app/components/ui/CallToActionButton";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";

interface ServiceDetailSectionProps {
  service: {
    title: string;
    description: string;
    services: string[];
  };
  /** CMS image; omitted when not set in WordPress */
  graphicImage?: string | StaticImageData;
  graphicAlt?: string;
  videoSrc?: string;
  imagePosition?: "left" | "right";
  className?: string;
  buttonText?: string;
  redirectUrl?: string;
}

export default function ServiceDetailSection({
  service,
  graphicImage,
  graphicAlt = "",
  videoSrc,
  imagePosition = "right",
  className = "",
  buttonText = "",
  redirectUrl,
}: ServiceDetailSectionProps) {
  const router = useRouter();
  const isImageLeft = imagePosition === "left";
  const video = videoSrc?.trim();
  const hasGraphic =
    graphicImage != null &&
    (typeof graphicImage === "object" ||
      (typeof graphicImage === "string" && graphicImage.trim().length > 0));
  const hasMedia = Boolean(video) || hasGraphic;

  const handleButtonClick = () => {
    if (redirectUrl) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      router.push(redirectUrl);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 100);
    }
  };

  const textContent = (
    <div className="flex flex-col space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-7 xl:space-y-8">
      <h2 className="text-[20px] sm:text-[28px] md:text-[35px] lg:text-[40px] xl:text-[42px] 2xl:text-[60px] min-[1440px]:text-[70px] min-[1920px]:text-[80px] font-[700] text-white leading-[32px] sm:leading-[38px] md:leading-[55px] lg:leading-[60px] xl:leading-[70px] 2xl:leading-[75px] min-[1440px]:leading-[80px] min-[1920px]:leading-[88px]">
        {service?.title}
      </h2>

      <p
        className="text-[14px] sm:text-[15px] md:text-[18px] lg:text-[14px] xl:text-[16px] 2xl:text-[20px] min-[1440px]:text-[21px] min-[1920px]:text-[22px] font-[500] text-white leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]"
        dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(service?.description ?? "") }}
      />

      <div className="flex flex-col space-y-0">
        {service?.services.map((serviceItem, index) => (
          <div key={index}>
            <p className="text-[16px] sm:text-[18px] md:text-[22px] lg:text-[20px] xl:text-[22px] 2xl:text-[28px] min-[1440px]:text-[29px] min-[1920px]:text-[30px] font-[500] text-white leading-[1.4] sm:leading-[1.5] md:leading-[1.6] lg:leading-[1.55] xl:leading-[1.5] 2xl:leading-[1.45] py-3 sm:py-3.5 md:py-4 lg:py-4.5 xl:py-5">
              {serviceItem}
            </p>
            {index < service.services.length - 1 && (
              <div className="border-t border-[#434343]" />
            )}
          </div>
        ))}
      </div>

      {buttonText.trim() ? (
        <div className="pt-3 sm:pt-3.5 md:pt-4 lg:pt-4.5 xl:pt-5 relative z-10">
          <CallToActionButton
            variant="shiny"
            onClick={redirectUrl ? handleButtonClick : undefined}
          >
            {buttonText}
          </CallToActionButton>
        </div>
      ) : null}
    </div>
  );

  const graphicContent = hasMedia ? (
    <div className="flex items-center justify-center lg:justify-end h-full w-full pointer-events-none overflow-visible">
      <div className="relative w-full h-full min-h-[250px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px] 2xl:min-h-[700px] overflow-visible">
        {video ? (
          <video
            src={video}
            autoPlay
            loop
            muted
            playsInline
            className="!object-contain sm:!object-contain md:!object-contain lg:!object-contain xl:!object-cover 2xl:!object-cover w-full h-full rounded-lg service-detail-video"
          />
        ) : hasGraphic && graphicImage ? (
          <Image
            src={graphicImage}
            alt={graphicAlt}
            fill
            className="!object-contain sm:!object-contain md:!object-contain lg:!object-contain xl:!object-cover 2xl:!object-cover w-full h-full rounded-lg"
            unoptimized={typeof graphicImage === "string"}
          />
        ) : null}
      </div>
    </div>
  ) : null;

  const gridClass = hasMedia
    ? "grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14 2xl:gap-16 items-stretch w-full overflow-visible service-detail-section-grid"
    : "grid grid-cols-1 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14 2xl:gap-16 items-stretch w-full overflow-visible service-detail-section-grid";

  return (
    <section className={`relative bg-black pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-28 2xl:pb-32 overflow-visible isolate ${className}`}>
      <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 w-full max-w-[1494px] global-section-padding service-detail-section-container">
        <div className={gridClass}>
          {hasMedia ? (
            isImageLeft ? (
              <>
                <div className="order-1 lg:order-2 flex flex-col service-detail-text-content">
                  {textContent}
                </div>
                <div className="order-2 lg:order-1 flex flex-col min-w-0 w-full">
                  {graphicContent}
                </div>
              </>
            ) : (
              <>
                <div className="order-1 lg:order-1 flex flex-col service-detail-text-content">
                  {textContent}
                </div>
                <div className="order-2 lg:order-2 flex flex-col min-w-0 w-full">
                  {graphicContent}
                </div>
              </>
            )
          ) : (
            <div className="flex flex-col service-detail-text-content">{textContent}</div>
          )}
        </div>
      </div>
    </section>
  );
}
