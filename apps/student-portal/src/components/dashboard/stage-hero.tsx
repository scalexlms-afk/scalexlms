import { RocketLaunch } from "@phosphor-icons/react/dist/ssr";
import { Card, ProgressBar } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";

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
    <Card className="relative overflow-hidden metallic-graphite">
      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <p className={academyEyebrowMutedClass}>Business Stage</p>
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
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-scalex-red/25 to-transparent blur-xl" />
            <RocketLaunch
              weight="duotone"
              className="relative h-16 w-16 text-scalex-red"
            />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-scalex-red/10 blur-3xl"
        aria-hidden="true"
      />
    </Card>
  );
}
