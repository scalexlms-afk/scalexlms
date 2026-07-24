import Image from "next/image";

/** Bump when regenerating public/illustrations so clients/CDN skip stale assets. */
const ILLUSTRATION_CACHE_BUST = "rembg-v2";

export function AcademyIllustration({
  src,
  alt = "",
  size = 144,
  className = "",
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  const bustedSrc = src.includes("?")
    ? `${src}&v=${ILLUSTRATION_CACHE_BUST}`
    : `${src}?v=${ILLUSTRATION_CACHE_BUST}`;

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={bustedSrc}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority={false}
        unoptimized
      />
    </div>
  );
}
