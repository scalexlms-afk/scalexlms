import Image from "next/image";

/**
 * Restrained photographic atmosphere shared by Academy hero cards.
 * It echoes the landing page without changing card layout or readability.
 */
export function AcademyHeroBackdrop({
  src = "/landing/hero-product.png",
  position = "object-center",
}: {
  src?: string;
  position?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={src}
        alt=""
        fill
        sizes="(min-width: 768px) 70vw, 100vw"
        className={`object-cover opacity-[0.13] saturate-75 ${position}`}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-2 via-surface-2/92 to-surface-2/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(227,30,36,0.18),transparent_36%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
