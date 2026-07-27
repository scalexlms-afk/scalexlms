import Link from "next/link";
import { Robot, ArrowRight } from "@phosphor-icons/react";

export function AskAiBanner({
  queryHint = "Help me with my Amazon FBA question",
}: {
  queryHint?: string;
}) {
  const href = `/ai-mentor?q=${encodeURIComponent(queryHint)}`;

  return (
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
  );
}
