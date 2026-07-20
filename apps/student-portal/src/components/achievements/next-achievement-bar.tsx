import { Gift } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import type { AchievementItem } from "@/lib/achievements";

export function NextAchievementBar({
  achievement,
}: {
  achievement: AchievementItem | null;
}) {
  if (!achievement) {
    return (
      <Card className="border-accent-green/30 bg-accent-green/5">
        <p className="font-display text-lg font-semibold text-foreground">
          All achievements unlocked
        </p>
        <p className="mt-1 text-sm text-muted">
          You’ve completed every tracked achievement on this journey.
        </p>
      </Card>
    );
  }

  const pct = achievement.progressPercent;

  return (
    <Card className="relative overflow-hidden border-scalex-red/25 bg-gradient-to-r from-scalex-red/10 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={academyEyebrowMutedClass}>Next Achievement</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {achievement.title}
          </p>
          <div className="mt-3 max-w-xl">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                {achievement.state === "in_progress" ? "In progress" : "Up next"}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-scalex-red transition-all"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        </div>
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-scalex-red/15 text-scalex-red metallic-edge"
          aria-hidden
        >
          <Gift weight="duotone" className="h-7 w-7" />
        </span>
      </div>
    </Card>
  );
}
