import { RocketLaunch } from "@phosphor-icons/react/dist/ssr";
import { Card, ProgressBar } from "@scalex/ui";
import {
  AcademyCtaLink,
  academyEyebrowMutedClass,
} from "@/components/academy-cta";

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
          <p className={academyEyebrowMutedClass}>Your Business Journey</p>
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
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-scalex-red/20 blur-2xl" />
            <RocketLaunch
              weight="duotone"
              className="relative h-16 w-16 text-scalex-red"
            />
          </div>
        </div>

        <div className="min-w-0 lg:text-right">
          <p className={academyEyebrowMutedClass}>Next Unlock</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {unlocksLabel}
          </p>
          <p className="mt-1 text-sm text-muted">
            Estimated: {estimatedTimeLabel}
          </p>
          <AcademyCtaLink
            href={continueHref}
            className="mt-4 w-full lg:w-auto"
          >
            Continue Learning →
          </AcademyCtaLink>
        </div>
      </div>
    </Card>
  );
}
