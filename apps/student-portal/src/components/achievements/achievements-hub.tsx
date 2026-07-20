"use client";

import { useMemo, useState } from "react";
import {
  Buildings,
  Lock,
  MagnifyingGlass,
  Package,
  Rocket,
  Storefront,
  Truck,
} from "@phosphor-icons/react";
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
      className={`relative rounded-[var(--radius-card)] border bg-surface-2 p-4 text-left metallic-edge transition-colors hover:bg-surface-3 ${border}`}
    >
      {item.state === "completed" ? (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-green text-[10px] font-bold text-white">
          ✓
        </span>
      ) : item.state === "locked" ? (
        <span className="absolute right-2 top-2 text-subtle" aria-hidden>
          <Lock weight="bold" className="h-4 w-4" />
        </span>
      ) : null}

      <span
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border bg-surface-3/60 metallic-edge ${accent}`}
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

function CategoryGlyph({
  category,
}: {
  category: Exclude<AchievementCategory, "all">;
}) {
  const className = "h-5 w-5";
  switch (category) {
    case "business_setup":
      return <Buildings weight="duotone" className={className} />;
    case "product_research":
      return <MagnifyingGlass weight="duotone" className={className} />;
    case "supplier_sourcing":
      return <Truck weight="duotone" className={className} />;
    case "brand_listing":
      return <Storefront weight="duotone" className={className} />;
    case "launch_sales":
      return <Rocket weight="duotone" className={className} />;
    case "scaling":
      return <Package weight="duotone" className={className} />;
  }
}
