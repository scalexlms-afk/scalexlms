import type { ReactNode } from "react";
import {
  Flag,
  Medal,
  SealCheck,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import type { AchievementsStats } from "@/lib/achievements";

export function AchievementsStatsRow({ stats }: { stats: AchievementsStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="!p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-scalex-red/15 text-scalex-red metallic-edge">
            <Trophy weight="duotone" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={academyEyebrowMutedClass}>Your Business Level</p>
            <p className="mt-0.5 font-display text-lg font-bold text-foreground">
              {stats.levelLabel}{" "}
              <span className="text-sm font-semibold text-muted">
                (Level {stats.levelNumber})
              </span>
            </p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[10px] text-muted">
                <span>Business Progress</span>
                <span>{stats.businessProgressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-scalex-red"
                  style={{ width: `${stats.businessProgressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <StatCard
        label="Achievements Unlocked"
        value={`${stats.unlockedCount} of ${stats.totalAchievements}`}
        iconClass="bg-accent-green/15 text-accent-green"
        icon={<Medal weight="duotone" className="h-5 w-5" />}
      />
      <StatCard
        label="Milestones Completed"
        value={`${stats.milestonesCompleted} of ${stats.milestonesTotal}`}
        iconClass="bg-accent-blue/15 text-accent-blue"
        icon={<Flag weight="duotone" className="h-5 w-5" />}
      />
      <StatCard
        label="Certificates Earned"
        value={`${stats.certificatesEarned} of ${stats.certificatesTotal}`}
        iconClass="bg-accent-gold/15 text-accent-gold"
        icon={<SealCheck weight="duotone" className="h-5 w-5" />}
        hint="Course certificate after program completion"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  iconClass,
  icon,
  hint,
}: {
  label: string;
  value: string;
  iconClass: string;
  icon: ReactNode;
  hint?: string;
}) {
  return (
    <Card className="!p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl metallic-edge ${iconClass}`}
        >
          {icon}
        </span>
        <div>
          <p className={academyEyebrowMutedClass}>{label}</p>
          <p className="font-display text-xl font-bold text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-0.5 text-[10px] text-subtle">{hint}</p> : null}
        </div>
      </div>
    </Card>
  );
}
