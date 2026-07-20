import Link from "next/link";
import { Card, ProgressBar } from "@scalex/ui";

export function RoadmapHero({
  currentStage,
  stepIndex,
  totalSteps,
  completionPercent,
  unlocksLabel,
  estimatedTimeLabel,
  continueHref,
}: {
  currentStage: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  unlocksLabel: string;
  estimatedTimeLabel: string;
  continueHref: string;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/25 bg-gradient-to-br from-scalex-red/15 via-surface-2 to-surface-2">
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Your Business Journey
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
            {currentStage}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Step {stepIndex} of {totalSteps}
          </p>
          <div className="mt-4 max-w-sm">
            <ProgressBar
              value={completionPercent}
              label={`${Math.round(completionPercent)}% Complete`}
              showPercent={false}
            />
          </div>
        </div>

        <div className="hidden justify-center lg:flex" aria-hidden="true">
          <RocketGraphic />
        </div>

        <div className="min-w-0 lg:text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Next Unlock
          </p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {unlocksLabel}
          </p>
          <p className="mt-1 text-sm text-muted">
            Estimated: {estimatedTimeLabel}
          </p>
          <Link
            href={continueHref}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-scalex-red px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-scalex-red-dark lg:w-auto"
          >
            Continue Learning →
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RocketGraphic() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-scalex-red/20 blur-2xl" />
      <svg
        viewBox="0 0 80 80"
        className="relative h-20 w-20 text-scalex-red"
        fill="none"
      >
        <path
          d="M40 10c8 10 12 22 12 34 0 8-4 14-12 20-8-6-12-12-12-20 0-12 4-24 12-34Z"
          fill="currentColor"
          opacity="0.2"
        />
        <path
          d="M40 14c6 8 9 18 9 30 0 6-3 11-9 16-6-5-9-10-9-16 0-12 3-22 9-30Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="36" r="4" fill="currentColor" />
        <path
          d="M31 48c-4 2-7 6-8 11 5-1 9-3 12-6M49 48c4 2 7 6 8 11-5-1-9-3-12-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
