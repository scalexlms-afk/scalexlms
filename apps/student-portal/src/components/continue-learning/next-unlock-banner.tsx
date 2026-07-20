import Link from "next/link";
import { Check, Gift } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowClass, academyEyebrowMutedClass } from "@/components/academy-cta";
import type { DashboardMilestone } from "@/lib/dashboard";

export function NextUnlockBanner({
  nextMilestone,
  unlocksLabel,
}: {
  nextMilestone: DashboardMilestone | null;
  unlocksLabel: string;
}) {
  return (
    <Card className="border-scalex-red/25 bg-gradient-to-r from-scalex-red/10 via-surface-2 to-surface-2">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-scalex-red/15 text-scalex-red metallic-edge">
            <Gift weight="duotone" className="h-6 w-6" />
          </span>
          <div>
            <p className={academyEyebrowMutedClass}>Next Unlock</p>
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
                  <Check weight="bold" className="h-4 w-4 text-accent-green" />
                  Access the next milestone lessons
                </li>
                <li className="flex items-center gap-2">
                  <Check weight="bold" className="h-4 w-4 text-accent-green" />
                  Keep your launch roadmap moving
                </li>
              </ul>
            )}
          </div>
        </div>
        <div className="shrink-0 rounded-xl border border-line bg-surface/60 px-4 py-3 metallic-edge">
          <p className={academyEyebrowClass}>Keep going</p>
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
