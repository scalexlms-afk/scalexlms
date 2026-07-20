import type { ReactNode } from "react";
import {
  Clock,
  Flag,
  FolderOpen,
  Star,
  Waveform,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import {
  AcademyCtaLink,
  academyEyebrowClass,
  academyEyebrowMutedClass,
} from "@/components/academy-cta";

export function MissionHero({
  title,
  body,
  estimatedTimeLabel,
  difficultyLabel,
  continueHref,
}: {
  title: string;
  body: string;
  estimatedTimeLabel: string;
  difficultyLabel: string;
  continueHref: string;
}) {
  return (
    <Card className="relative overflow-hidden border-scalex-red/25 bg-gradient-to-br from-scalex-red/15 via-surface-2 to-surface-2">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-scalex-red/20 text-scalex-red metallic-edge">
              <Star weight="fill" className="h-4 w-4" />
            </span>
            <p className={academyEyebrowMutedClass}>Today&apos;s Mission</p>
          </div>

          <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {body}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <MetaChip
              icon={<Clock weight="duotone" className="h-4 w-4" />}
              label="Estimated Time"
              value={estimatedTimeLabel}
            />
            <MetaChip
              icon={<Flag weight="duotone" className="h-4 w-4" />}
              label="Priority"
              value="Required"
            />
            <MetaChip
              icon={<Waveform weight="duotone" className="h-4 w-4" />}
              label="Format"
              value={difficultyLabel}
            />
          </div>

          <AcademyCtaLink href={continueHref} className="mt-6 w-full sm:w-auto">
            Continue Journey →
          </AcademyCtaLink>
          <p className="mt-3 text-xs text-subtle">
            This step is required to unlock the next milestone.
          </p>
        </div>

        <div className="hidden shrink-0 lg:block" aria-hidden="true">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-scalex-red/10 blur-2xl" />
            <FolderOpen
              weight="duotone"
              className="relative h-28 w-28 text-scalex-red"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetaChip({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface/70 px-3 py-2 metallic-edge">
      <span className="text-scalex-red">{icon}</span>
      <div>
        <p className={academyEyebrowClass}>{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
