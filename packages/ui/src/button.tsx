"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-scalex-red hover:bg-scalex-red-dark text-white border-transparent shadow-[0_6px_20px_-8px_rgba(227,30,36,0.7)] hover:shadow-[0_8px_24px_-6px_rgba(227,30,36,0.8)]",
  secondary:
    "bg-transparent border border-white/10 text-text-primary-dark hover:bg-scalex-charcoal-alt hover:border-white/20",
  tertiary:
    "bg-transparent text-scalex-red hover:text-scalex-red-dark border-transparent hover:underline underline-offset-4",
  destructive:
    "bg-accent-danger hover:bg-red-600 text-white border-transparent shadow-[0_6px_20px_-8px_rgba(239,68,68,0.7)]",
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
      className={`inline-flex items-center justify-center rounded-[var(--radius-button)] border font-medium transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scalex-red/50 focus-visible:ring-offset-2 focus-visible:ring-offset-scalex-black disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
