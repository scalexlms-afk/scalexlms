import Link from "next/link";
import { BADGE_LABELS, LEVEL_LABELS } from "@scalex/db";
import { BadgeMedallion, Card } from "@scalex/ui";
import type { Badge } from "@/lib/data";

export function AchievementsRow({
  badges,
  level,
  completionPercent,
}: {
  badges: Badge[];
  level: string | null;
  completionPercent?: number;
}) {
  const earned = new Set(badges.map((b) => b.key));
  const display = Object.entries(BADGE_LABELS).slice(0, 6);

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Achievements</h2>
          <p className="mt-1 text-sm text-muted">
            Level:{" "}
            <span className="text-foreground">
              {level ? LEVEL_LABELS[level] ?? level : "Beginner Seller"}
            </span>
            {completionPercent != null ? (
              <span className="ml-2 text-foreground">
                · {completionPercent}% complete
              </span>
            ) : null}
          </p>
        </div>
        <Link
          href="/achievements"
          className="text-sm font-medium text-scalex-red hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap gap-6">
        {display.map(([key, label]) => (
          <BadgeMedallion
            key={key}
            label={label}
            earned={earned.has(key)}
          />
        ))}
      </div>
    </Card>
  );
}
