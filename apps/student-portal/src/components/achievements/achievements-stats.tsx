import type { ReactNode } from "react";
import { Card } from "@scalex/ui";
import type { AchievementsStats } from "@/lib/achievements";

export function AchievementsStatsRow({ stats }: { stats: AchievementsStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="!p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
            <TrophyIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Your Business Level
            </p>
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
                  className="h-full rounded-full bg-accent-purple"
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
        icon={<MedalIcon />}
      />
      <StatCard
        label="Milestones Completed"
        value={`${stats.milestonesCompleted} of ${stats.milestonesTotal}`}
        iconClass="bg-accent-blue/15 text-accent-blue"
        icon={<FlagIcon />}
      />
      <StatCard
        label="Certificates Earned"
        value={`${stats.certificatesEarned} of ${stats.certificatesTotal}`}
        iconClass="bg-accent-gold/15 text-accent-gold"
        icon={<CertIcon />}
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
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="font-display text-xl font-bold text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-0.5 text-[10px] text-subtle">{hint}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M8 4h8v3a4 4 0 0 1-8 0V4Zm0 0H5a2 2 0 0 0 2 4h1M16 4h3a2 2 0 0 1-2 4h-1M12 11v3m-3 6h6a2 2 0 0 0 2-2v-1H7v1a2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="10" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m9 14-1.5 6L12 17l4.5 3L15 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M6 21V4m0 0h9l-1.5 3L15 10H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m9 13.5 1 7 2-1.5 2 1.5 1-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
