import { Card } from "@scalex/ui";
import {
  AcademyCtaAnchor,
  AcademyCtaLink,
  academyEyebrowClass,
  academyEyebrowMutedClass,
} from "@/components/academy-cta";
import { AcademyHeroBackdrop } from "@/components/academy-hero-backdrop";
import { AcademyIllustration } from "@/components/academy-illustration";

export function CurrentTaskHero({
  title,
  milestoneTitle,
  description,
  estimatedTimeLabel,
  formatsLabel,
  unlockReward,
  lessonHref,
  canSubmit,
}: {
  title: string;
  milestoneTitle: string;
  description: string;
  estimatedTimeLabel: string;
  formatsLabel: string;
  unlockReward: string;
  lessonHref: string;
  canSubmit: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/25">
      <AcademyHeroBackdrop />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className={academyEyebrowMutedClass}>
            Current Task · {milestoneTitle}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {description}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Meta label="Estimated Time" value={estimatedTimeLabel} />
            <Meta label="Due Date" value="No deadline" />
            <Meta label="Formats" value={formatsLabel || "Any"} />
            <Meta label="Reward" value={`Unlock ${unlockReward}`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canSubmit ? (
              <AcademyCtaAnchor href="#submit">Start Task</AcademyCtaAnchor>
            ) : (
              <AcademyCtaAnchor href="#review-status">
                View Status
              </AcademyCtaAnchor>
            )}
            <AcademyCtaLink href={lessonHref} variant="secondary">
              View Lesson
            </AcademyCtaLink>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <AcademyIllustration
            src="/illustrations/folder-upload.png"
            size={144}
          />
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 px-3 py-2 metallic-edge">
      <p className={academyEyebrowClass}>{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
