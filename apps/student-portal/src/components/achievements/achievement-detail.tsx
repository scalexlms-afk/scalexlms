import Link from "next/link";
import { StatusPill, Card } from "@scalex/ui";
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

  const barClass =
    achievement.state === "completed"
      ? "bg-accent-green"
      : achievement.state === "in_progress"
        ? "bg-accent-amber"
        : "bg-surface-3";

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={academyEyebrowClass}>Achievement Details</p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">
            {achievement.title}
          </h2>
        </div>
        {achievement.state === "in_progress" ? (
          <StatusPill label="In Progress" variant="pending" />
        ) : achievement.state === "completed" ? (
          <StatusPill label="Completed" variant="approved" />
        ) : (
          <StatusPill label="Locked" variant="neutral" />
        )}
      </div>

      <p className="text-sm leading-relaxed text-muted">
        {achievement.description}
      </p>

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
            className={`h-full rounded-full ${barClass}`}
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
