"use client";

import Link from "next/link";
import { MagnifyingGlass, Robot, ArrowRight } from "@phosphor-icons/react";

export function AskAiBanner({
  queryHint = "Help me with my Amazon FBA question",
  sticky,
  onSearchSimilar,
}: {
  queryHint?: string;
  sticky?: boolean;
  onSearchSimilar?: () => void;
}) {
  const href = `/ai-mentor?q=${encodeURIComponent(queryHint)}`;

  return (
    <div
      className={`space-y-2 ${
        sticky
          ? "sticky bottom-4 z-10 rounded-2xl border border-accent-purple/30 bg-surface/95 p-2 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.65)] backdrop-blur"
          : ""
      }`}
    >
      <Link
        href={href}
        className="flex items-center gap-4 rounded-2xl border border-accent-purple/30 bg-gradient-to-r from-accent-purple/15 via-accent-purple/8 to-transparent px-4 py-4 transition hover:border-accent-purple/50 hover:from-accent-purple/20 sm:px-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
          <Robot weight="duotone" className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-foreground">
            Ask AI Mentor
          </p>
          <p className="mt-0.5 text-sm text-muted">
            Stuck on a thread? Get curriculum-grounded help in seconds.
          </p>
        </div>
        <ArrowRight
          weight="bold"
          className="hidden h-5 w-5 shrink-0 text-accent-purple sm:block"
          aria-hidden
        />
      </Link>
      {onSearchSimilar ? (
        <button
          type="button"
          onClick={onSearchSimilar}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2/70 px-3 py-2 text-xs font-semibold text-muted transition hover:border-accent-purple/40 hover:text-foreground"
        >
          <MagnifyingGlass className="h-3.5 w-3.5" aria-hidden />
          Search Similar
        </button>
      ) : null}
    </div>
  );
}
