"use client";

import { Bell, EnvelopeOpen, GearSix } from "@phosphor-icons/react";

export function NotificationsHero({
  unreadCount,
  onMarkAll,
  markingAll,
}: {
  unreadCount: number;
  onMarkAll: () => void;
  markingAll: boolean;
}) {
  function scrollToPrefs() {
    document
      .getElementById("notification-preferences")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <Bell weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Notifications
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Stay updated with everything that matters in your journey.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onMarkAll}
          disabled={unreadCount === 0 || markingAll}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EnvelopeOpen weight="bold" className="h-4 w-4" aria-hidden />
          {markingAll ? "Marking…" : "Mark all as read"}
        </button>
        <button
          type="button"
          onClick={scrollToPrefs}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3"
        >
          <GearSix weight="bold" className="h-4 w-4" aria-hidden />
          Notification settings
        </button>
      </div>
    </div>
  );
}
