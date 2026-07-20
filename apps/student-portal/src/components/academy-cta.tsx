import Link from "next/link";
import type { ReactNode } from "react";

const primaryClasses =
  "inline-flex items-center justify-center rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm font-semibold text-white metallic-red glow-red transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scalex-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0 active:scale-[0.98]";

const secondaryClasses =
  "inline-flex items-center justify-center rounded-full border border-line bg-surface-2/80 px-5 py-3 text-sm font-semibold text-foreground metallic-edge transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scalex-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-0";

export function AcademyCtaLink({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const base = variant === "primary" ? primaryClasses : secondaryClasses;
  return (
    <Link href={href} className={`${base} ${className}`}>
      {children}
    </Link>
  );
}

export function AcademyCtaAnchor({
  href,
  children,
  className = "",
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const base = variant === "primary" ? primaryClasses : secondaryClasses;
  return (
    <a href={href} className={`${base} ${className}`}>
      {children}
    </a>
  );
}

export const academyEyebrowClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle";

export const academyEyebrowMutedClass =
  "text-xs font-semibold uppercase tracking-[0.14em] text-muted";
