"use client";

import Link from "next/link";
import { ArrowRight, Star } from "@phosphor-icons/react";

export function PriorityBanner({ premium }: { premium: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-purple/25 bg-gradient-to-r from-accent-purple/15 via-accent-purple/8 to-transparent px-4 py-4 sm:px-5">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/25 text-accent-purple metallic-edge"
          aria-hidden
        >
          <Star weight="fill" className="h-5 w-5" />
        </span>
        <p className="text-sm text-muted sm:text-[15px]">
          {premium ? (
            <>
              Premium members get priority support. Your assigned mentor is
              notified first and responds faster.
            </>
          ) : (
            <>
              Upgrade to Premium for priority support — your assigned mentor is
              notified first and responds faster.
            </>
          )}
        </p>
      </div>

      {premium ? (
        <Link
          href="/billing"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3.5 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          View Premium Benefits
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
        </Link>
      ) : (
        <Link
          href="/payment?mode=upgrade"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3.5 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          Upgrade
          <ArrowRight className="h-4 w-4" weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  );
}
