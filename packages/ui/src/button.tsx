"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "metallic-red text-white border-white/10 shadow-[0_8px_24px_-8px_rgba(227,30,36,0.65),inset_0_1px_0_0_rgba(255,255,255,0.25)] hover:brightness-110 hover:shadow-[0_10px_28px_-6px_rgba(227,30,36,0.8),inset_0_1px_0_0_rgba(255,255,255,0.3)]",
  secondary:
    "bg-surface-2 border border-line text-foreground hover:bg-surface-3 hover:border-line-strong metallic-edge",
  tertiary:
    "bg-transparent text-scalex-red hover:text-scalex-red-dark border-transparent hover:underline underline-offset-4",
  destructive:
    "bg-accent-danger text-white border-white/10 shadow-[0_8px_24px_-8px_rgba(239,68,68,0.65),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:brightness-110",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm font-semibold gap-2",
  lg: "px-6 py-3 text-base font-semibold gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--radius-button)] border font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scalex-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
