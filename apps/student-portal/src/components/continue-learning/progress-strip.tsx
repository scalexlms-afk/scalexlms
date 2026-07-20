import { Card, ProgressBar } from "@scalex/ui";

export function ProgressStrip({
  stageTitle,
  stepIndex,
  totalSteps,
  completionPercent,
  unlocksLabel,
}: {
  stageTitle: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  unlocksLabel: string;
}) {
  return (
    <Card className="!py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="shrink-0 lg:w-48">
          <p className="font-semibold text-foreground">{stageTitle}</p>
          <p className="text-xs text-muted">
            Step {stepIndex} of {totalSteps}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <ProgressBar
            value={completionPercent}
            label={`${Math.round(completionPercent)}% Complete`}
            showPercent={false}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface-3/60 px-3 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M4 10h16v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8Zm2-4h12l2 4H4l2-4Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">
              Next Unlock
            </p>
            <p className="text-sm font-medium text-foreground">{unlocksLabel}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
