import { Card, ProgressBar } from "@scalex/ui";

export function StageHero({
  stageTitle,
  stepIndex,
  totalSteps,
  completionPercent,
}: {
  stageTitle: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Business Stage
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">
            {stageTitle}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Step {stepIndex} of {totalSteps}
          </p>
          <div className="mt-5 max-w-xl">
            <ProgressBar
              value={completionPercent}
              label={`${Math.round(completionPercent)}% Complete`}
              showPercent={false}
            />
          </div>
        </div>

        <div
          className="pointer-events-none hidden shrink-0 md:block"
          aria-hidden="true"
        >
          <RocketGraphic />
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-scalex-red/10 blur-3xl"
        aria-hidden="true"
      />
    </Card>
  );
}

function RocketGraphic() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-scalex-red/20 to-transparent" />
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
        <path
          d="M36 62c1.2 4 2.5 7 4 10 1.5-3 2.8-6 4-10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </div>
  );
}
