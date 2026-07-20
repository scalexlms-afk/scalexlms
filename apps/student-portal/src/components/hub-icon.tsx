import type { Icon } from "@phosphor-icons/react";

/** Consistent Phosphor sizing for Academy hub icon chips. */
export function HubIcon({
  icon: Icon,
  className = "h-5 w-5",
  weight = "duotone",
}: {
  icon: Icon;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}) {
  return <Icon weight={weight} className={className} aria-hidden />;
}

export const hubIconChipClass =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-3/60 metallic-edge";
