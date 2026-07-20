"use client";

import { useMemo, useState } from "react";
import type {
  AchievementCategory,
  AchievementItem,
} from "@/lib/achievements";
import { AchievementDetail } from "@/components/achievements/achievement-detail";
import { JourneyTimeline } from "@/components/achievements/journey-timeline";
import { MilestoneRewards } from "@/components/achievements/milestone-rewards";
import type { DashboardMilestone } from "@/lib/dashboard";

const CATEGORY_ACCENT: Record<
  Exclude<AchievementCategory, "all">,
  string
> = {
  business_setup: "text-accent-green border-accent-green/40",
  product_research: "text-accent-blue border-accent-blue/40",
  supplier_sourcing: "text-accent-purple border-accent-purple/40",
  brand_listing: "text-scalex-red border-scalex-red/40",
  launch_sales: "text-accent-amber border-accent-amber/40",
  scaling: "text-accent-gold border-accent-gold/40",
};

export function AchievementsHub({
  achievements,
  categories,
  defaultSelectedId,
  journeyMilestones,
  initialShowAll = false,
}: {
  achievements: AchievementItem[];
  categories: { id: AchievementCategory; label: string }[];
  defaultSelectedId: string;
  journeyMilestones: DashboardMilestone[];
  initialShowAll?: boolean;
}) {
  const [filter, setFilter] = useState<AchievementCategory>("all");
  const [selectedId, setSelectedId] = useState(
    defaultSelectedId || achievements[0]?.id || ""
  );
  const [showAll, setShowAll] = useState(initialShowAll);

  const filtered = useMemo(() => {
    if (filter === "all") return achievements;
    return achievements.filter((a) => a.category === filter);
  }, [achievements, filter]);

  const visible = showAll ? filtered : filtered.slice(0, 10);
  const selected =
    achievements.find((a) => a.id === selectedId) ??
    filtered[0] ??
    null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const active = filter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setFilter(cat.id);
                setShowAll(false);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "border-scalex-red bg-scalex-red text-white"
                  : "border-line bg-surface-2 text-muted hover:border-scalex-red/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
          No achievements in this category yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((item) => (
            <AchievementCard
              key={item.id}
              item={item}
              selected={selected?.id === item.id}
              onSelect={() => setSelectedId(item.id)}
            />
          ))}
        </div>
      )}

      {filtered.length > 10 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3"
          >
            {showAll ? "Show fewer" : "View More Achievements"}
          </button>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <AchievementDetail achievement={selected} />
        <div className="space-y-5">
          <JourneyTimeline milestones={journeyMilestones} />
          <MilestoneRewards />
        </div>
      </div>
    </div>
  );
}

function AchievementCard({
  item,
  selected,
  onSelect,
}: {
  item: AchievementItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = CATEGORY_ACCENT[item.category];
  const border =
    item.state === "in_progress"
      ? "border-accent-amber/50 ring-1 ring-accent-amber/30"
      : selected
        ? "border-scalex-red/40 ring-1 ring-scalex-red/20"
        : "border-line";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-[var(--radius-card)] border bg-surface-1 p-4 text-left metallic-edge transition-colors hover:bg-surface-2 ${border}`}
    >
      {item.state === "completed" ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-green text-[10px] font-bold text-white">
          ✓
        </span>
      ) : item.state === "locked" ? (
        <span className="absolute right-2 top-2 text-subtle" aria-hidden>
          <LockIcon />
        </span>
      ) : null}

      <span
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border bg-surface-2 ${accent}`}
      >
        <CategoryGlyph category={item.category} />
      </span>

      <p className="line-clamp-2 text-sm font-semibold text-foreground">
        {item.title}
      </p>

      {item.state === "completed" && item.earnedAt ? (
        <p className="mt-1 text-[11px] text-muted">
          {formatShortDate(item.earnedAt)}
        </p>
      ) : (
        <div className="mt-2">
          <div className="mb-0.5 flex justify-between text-[10px] text-muted">
            <span>
              {item.state === "in_progress" ? "In progress" : "Locked"}
            </span>
            <span>{item.progressPercent}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-surface-3">
            <div
              className={`h-full rounded-full ${
                item.state === "in_progress"
                  ? "bg-accent-amber"
                  : "bg-surface-3"
              }`}
              style={{ width: `${item.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryGlyph({
  category,
}: {
  category: Exclude<AchievementCategory, "all">;
}) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      {category === "business_setup" ? (
        <path
          d="M4 19h16M6 19V9l6-4 6 4v10M10 19v-5h4v5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : category === "product_research" ? (
        <path
          d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : category === "supplier_sourcing" ? (
        <path
          d="M3 7h13l3 5v6H3V7Zm13 0V5H8v2m-2 8h.01M16 15h.01"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : category === "brand_listing" ? (
        <path
          d="M4 7h16v12H4V7Zm4-3h8v3H8V4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : category === "launch_sales" ? (
        <path
          d="M4 18V6l8 4 8-4v12l-8 4-8-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M12 3v18m0-18 7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7l7-4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
