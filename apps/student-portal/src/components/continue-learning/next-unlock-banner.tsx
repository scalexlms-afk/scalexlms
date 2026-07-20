import Link from "next/link";
import { Card } from "@scalex/ui";
import type { DashboardMilestone } from "@/lib/dashboard";

export function NextUnlockBanner({
  nextMilestone,
  unlocksLabel,
}: {
  nextMilestone: DashboardMilestone | null;
  unlocksLabel: string;
}) {
  return (
    <Card className="border-accent-purple/25 bg-gradient-to-r from-accent-purple/10 via-surface-2 to-surface-2">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
              <path
                d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm2-4h12l2 4H4l2-4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Next Unlock
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">
              {unlocksLabel}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              {nextMilestone
                ? nextMilestone.firstModuleTitle
                  ? `Up next: ${nextMilestone.firstModuleTitle}. ${nextMilestone.moduleCount} module${
                      nextMilestone.moduleCount === 1 ? "" : "s"
                    } waiting after this mission.`
                  : `Complete your current mission to unlock ${nextMilestone.title}.`
                : "Finish this stage to complete your program pathway."}
            </p>
            {nextMilestone && (
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-accent-green">✓</span>
                  Access the next milestone lessons
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent-green">✓</span>
                  Keep your launch roadmap moving
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="shrink-0 rounded-xl border border-line bg-surface/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Keep going
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            You&apos;re doing great
          </p>
          <Link
            href="/roadmap"
            className="mt-2 inline-flex text-sm font-semibold text-scalex-red hover:underline"
          >
            View roadmap →
          </Link>
        </div>
      </div>
    </Card>
  );
}
