import { Card } from "@scalex/ui";
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
    <Card className="relative overflow-hidden border-accent-amber/30 bg-gradient-to-r from-accent-amber/10 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Next Achievement
          </p>
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
                className="h-full rounded-full bg-accent-amber transition-all"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        </div>
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-amber/20 text-accent-amber"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
            <path
              d="M12 3v3m0 12v3M4.5 7.5l2 2m11 0 2-2M3 12h3m12 0h3M6.5 18.5l2-2m7 0 2 2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <rect
              x="8"
              y="9"
              width="8"
              height="7"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        </span>
      </div>
    </Card>
  );
}
