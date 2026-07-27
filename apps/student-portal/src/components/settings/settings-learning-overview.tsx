"use client";

import { CheckCircle, Circle } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type {
  SettingsLearningStats,
  SettingsPageData,
} from "@/lib/settings-shared";

function CompletionRing({ percent }: { percent: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 88 88" aria-hidden>
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-line"
        />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-accent-purple"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-xl font-bold text-foreground">
          {percent}%
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Complete
        </span>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function SettingsLearningOverview({
  percent,
  checklist,
  stats,
}: {
  percent: number;
  checklist: SettingsPageData["checklist"];
  stats: SettingsLearningStats;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Learning Overview
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <CompletionRing percent={percent} />

        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Almost there! Complete your profile to unlock the best experience.
          </p>
          <ul className="mt-3 space-y-2">
            {checklist.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle
                    weight="fill"
                    className="h-4 w-4 shrink-0 text-accent-green"
                    aria-hidden
                  />
                ) : (
                  <Circle
                    weight="regular"
                    className="h-4 w-4 shrink-0 text-subtle"
                    aria-hidden
                  />
                )}
                <span
                  className={item.done ? "text-foreground" : "text-muted"}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-xl border border-line bg-surface-3/40 px-4 py-2">
          <StatRow label="Courses Enrolled" value={stats.coursesEnrolled} />
          <StatRow label="Tasks Completed" value={stats.tasksCompleted} />
          <StatRow
            label="Live Classes Attended"
            value={stats.liveClassesAttended}
          />
          <StatRow
            label="Achievements Earned"
            value={stats.achievementsEarned}
          />
          {/* Streak tracking not computed yet — omit placeholder dash */}
        </div>
      </div>
    </Card>
  );
}
