"use client";

import Image, { StaticImageData } from "next/image";

interface BeforeImageProps {
  image: string | StaticImageData;
  alt?: string;
  className?: string;
  imageClassName?: string;
}

export default function BeforeImage({
  image,
  alt = "",
  className = "",
  imageClassName = "",
}: BeforeImageProps) {
  return (
    <div className={`absolute left-0 top-0 h-full w-full overflow-hidden z-0 ${className}`}>
      <Image
        src={image}
        alt={alt}
        fill
        className={`object-cover object-left ${imageClassName}`}
        unoptimized
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.58) 42%, rgba(0,0,0,0.9) 58%, #000 70%), linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 9%, rgba(0,0,0,0.84) 18%, rgba(0,0,0,0.97) 24%, #000 30%)",
        }}
      />
    </div>
  );
}
