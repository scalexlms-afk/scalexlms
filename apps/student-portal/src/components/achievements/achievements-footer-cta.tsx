import Link from "next/link";
import { Card } from "@scalex/ui";

export function AchievementsFooterCta({ href }: { href: string }) {
  return (
    <Card className="border-scalex-red/20 bg-gradient-to-r from-scalex-red/10 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-gold/20 text-accent-gold"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2.5 14.2 8l5.8.5-4.4 3.8 1.4 5.7L12 15.6 6.9 18l1.4-5.7L4 8.5 9.8 8 12 2.5Z" />
            </svg>
          </span>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              Consistency Pays Off!
            </p>
            <p className="mt-1 text-sm text-muted">
              Keep completing tasks and achieving milestones.
            </p>
          </div>
        </div>
        <Link
          href={href}
          className="inline-flex rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white hover:bg-scalex-red-dark"
        >
          Continue Learning →
        </Link>
      </div>
    </Card>
  );
}
