import { Gift } from "@phosphor-icons/react/dist/ssr";
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
    <Card variant="glass" className="!py-4">
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
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface-3/60 px-3 py-2 metallic-edge">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-scalex-red/15 text-scalex-red">
            <Gift weight="duotone" className="h-4 w-4" aria-hidden />
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
