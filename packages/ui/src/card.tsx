import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "dark" | "light";
  interactive?: boolean;
}

export function Card({
  children,
  variant = "dark",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  const base =
    variant === "dark"
      ? "bg-scalex-charcoal border border-white/[0.06]"
      : "bg-scalex-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-text-primary-light";

  const hover = interactive
    ? variant === "dark"
      ? "transition-colors duration-200 hover:border-white/[0.14] hover:bg-scalex-charcoal-alt"
      : "transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
    : "";

  return (
    <div
      className={`rounded-[var(--radius-card)] p-5 md:p-6 ${base} ${hover} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
