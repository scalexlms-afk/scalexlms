import Link from "next/link";
import type { ReactNode } from "react";
import { Card, Logo } from "@scalex/ui";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-scalex-red/15 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo size="md" showTagline />
          </Link>
        </div>
        <Card>
          {title && (
            <h1 className="font-display text-2xl font-bold">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-text-secondary-dark">{subtitle}</p>
          )}
          {children}
        </Card>
        {footer && (
          <div className="mt-5 text-center text-sm text-text-secondary-dark">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
