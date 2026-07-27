"use client";

import { NOTIFICATION_FILTERS, type NotificationFilter } from "@/lib/notifications-shared";

export function NotificationFilters({
  active,
  unreadCount,
  onChange,
}: {
  active: NotificationFilter;
  unreadCount: number;
  onChange: (filter: NotificationFilter) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {NOTIFICATION_FILTERS.map((filter) => {
        const isActive = active === filter.id;
        const label =
          filter.id === "unread" && unreadCount > 0
            ? `${filter.label} (${unreadCount})`
            : filter.label;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-accent-purple text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.95)]"
                : "border border-line bg-surface-2/60 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
