import { splitCmsTextToParagraphs } from "@/app/lib/split-cms-text-to-paragraphs";
import TextSection from "../ui/TextSection";

interface WhatWeDeliveredProps {
  title?: string;
  description?: string;
  deliverables?: string[];
}

export default function WhatWeDelivered({
  title = "",
  description = "",
  deliverables = [],
}: WhatWeDeliveredProps) {
  if (deliverables.length === 0) return null;

  // Split WYSIWYG description into separate paragraphs so line breaks render correctly
  const descriptionParts = splitCmsTextToParagraphs(description);
  const paragraphs = [title, ...descriptionParts].filter(Boolean);

  return (
    <section className="w-full mx-auto relative py-20 px-4 lg:px-0">
      <div className="max-w-[1494px] mx-auto whatwedeliver-section px-10 sm:px-10 md:px-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <TextSection
              paragraphs={paragraphs}
              className="max-w-[1200px] mx-auto"
              firstParagraphClassName="text-[40px] md:text-[70px] font-light leading-tight items-center"
            />
          </div>

          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:justify-items-start">
              {deliverables.map((item, index) => {
                const shouldSkipBreak = item === "Amazing Design" || item === "Engaging Content";
                const parts = item.split(" ");
                const firstWord = parts[0];
                const rest = parts.slice(1).join(" ");
                return (
                  <div
                    key={index}
                    className="bg-[#1a1a1a] border border-[#BFBFBF] rounded-lg p-6 flex items-end justify-start text-center max-w-[286px] lg:max-w-[286px] w-full md:min-h-[199px] transition-all hover:border-[#BFBFBF] hover:scale-105 hover:shadow-[#5a5a5a] hover:cursor-pointer deliverable-item"
                  >
                    <p className="text-white text-[14px] text-start font-light leading-tight">
                      {shouldSkipBreak ? (
                        item
                      ) : (
                        <>
                          {firstWord}
                          {rest && <><br />{rest}</>}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

