import { Card, ProgressBar } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import { AcademyHeroBackdrop } from "@/components/academy-hero-backdrop";
import { AcademyIllustration } from "@/components/academy-illustration";

export function StageHero({
  stageTitle,
  stepIndex,
  totalSteps,
  completionPercent,
  coverSrc,
}: {
  stageTitle: string;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  coverSrc?: string | null;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/20">
      <AcademyHeroBackdrop src={coverSrc || undefined} />
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
          <AcademyIllustration
            src="/illustrations/rocket-purple.png"
            size={128}
          />
        </div>
      </div>
    </Card>
  );
}
