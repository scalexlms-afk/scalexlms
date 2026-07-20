import { Card } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import { AcademyIllustration } from "@/components/academy-illustration";
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
    <Card className="relative overflow-hidden border-accent-amber/30 bg-accent-amber/[0.07]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className={academyEyebrowMutedClass}>Next Achievement</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {achievement.title}
          </p>
          <div className="mt-3 max-w-xl">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>
                {achievement.state === "in_progress"
                  ? `${pct}% Complete`
                  : "Up next"}
              </span>
              <span className="font-semibold text-accent-amber">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-accent-amber transition-all"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        </div>
        <AcademyIllustration src="/illustrations/gift-box.png" size={72} />
      </div>
    </Card>
  );
}
