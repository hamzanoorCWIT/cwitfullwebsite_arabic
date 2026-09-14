import Image, { StaticImageData } from "next/image";

interface BackgroundImageSectionProps {
  backgroundImage: string | StaticImageData;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

export default function BackgroundImageSection({
  backgroundImage,
  alt = "Background",
  children,
  className = "",
  imageClassName = "",
  overlay = false,
  overlayClassName = "",
}: BackgroundImageSectionProps) {
  const isRemoteUrl = typeof backgroundImage === "string";

  return (
    <section className={`relative bg-black overflow-hidden isolate ${className} mx-auto my-20`}>
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 w-full h-full max-w-[1920px] pointer-events-none`}>
        {isRemoteUrl ? (
          <Image
            src={backgroundImage}
            alt={alt}
            fill
            className={imageClassName || "object-cover"}
            priority
            unoptimized
            sizes="100vw"
          />
        ) : (
          <Image
            src={backgroundImage}
            alt={alt}
            className={`${imageClassName}`}
            priority
            unoptimized
          />
        )}
      </div>

      {/* Optional Overlay */}
      {overlay && (
        <div className={`absolute inset-0 z-10 bg-black/50 ${overlayClassName}`} />
      )}

      {/* Content */}
      {children && (
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      )}
    </section>
  );
}

