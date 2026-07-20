import Link from "next/link";
import { Card } from "@scalex/ui";
import { academyEyebrowClass } from "@/components/academy-cta";
import type { AchievementItem } from "@/lib/achievements";

export function AchievementDetail({
  achievement,
}: {
  achievement: AchievementItem | null;
}) {
  if (!achievement) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold">
          Achievement Details
        </h2>
        <p className="mt-2 text-sm text-muted">
          Select an achievement to see requirements and rewards.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <p className={academyEyebrowClass}>Achievement Details</p>
        <h2 className="mt-1 font-display text-xl font-bold text-foreground">
          {achievement.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {achievement.description}
        </p>
      </div>

      <DetailRow label="Requirement" value={achievement.requirement} />
      <DetailRow label="Why It Matters" value={achievement.whyItMatters} />
      <DetailRow label="Reward" value={achievement.reward} />
      <DetailRow label="Estimated Time" value={achievement.estimatedTimeLabel} />

      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{achievement.progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-gradient-to-r from-scalex-red-dark to-scalex-red shadow-[0_0_12px_-2px_rgba(227,30,36,0.6)]"
            style={{ width: `${achievement.progressPercent}%` }}
          />
        </div>
      </div>

      {achievement.state !== "locked" ? (
        <Link
          href={achievement.href}
          className="inline-flex text-sm font-semibold text-scalex-red hover:underline"
        >
          {achievement.state === "completed"
            ? "View related task →"
            : "Continue toward this →"}
        </Link>
      ) : null}
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={academyEyebrowClass}>{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}
