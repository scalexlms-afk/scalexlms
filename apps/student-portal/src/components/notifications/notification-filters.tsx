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
        const showUnreadBadge = filter.id === "unread" && unreadCount > 0;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-accent-purple text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.95)]"
                : "border border-line bg-surface-2/60 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            {filter.label}
            {showUnreadBadge ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-white text-scalex-red"
                    : "bg-scalex-red text-white"
                }`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
