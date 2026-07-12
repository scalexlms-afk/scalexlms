import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "dark" | "light" | "glass";
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
    variant === "glass"
      ? "glass metallic-edge"
      : variant === "dark"
        ? "bg-surface-2 border border-line metallic-edge"
        : "bg-scalex-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-text-primary-light";

  const hover = interactive
    ? variant === "light"
      ? "transition-shadow duration-200 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
      : "transition-colors duration-200 hover:border-line-strong hover:bg-surface-3"
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
