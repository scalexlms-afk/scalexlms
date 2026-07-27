"use client";

import { BellSlash } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { NotificationItemRow } from "@/components/notifications/notification-item";
import {
  TIME_GROUP_LABELS,
  groupNotifications,
  type NotificationItem,
} from "@/lib/notifications-shared";

export function NotificationFeed({
  items,
  markReadAction,
}: {
  items: NotificationItem[];
  markReadAction: (formData: FormData) => Promise<void>;
}) {
  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-purple/15 text-accent-purple">
          <BellSlash weight="duotone" className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-4 font-display text-lg font-semibold text-foreground">
          You&apos;re all caught up
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          New reviews, mentor replies, and account alerts will show up here.
        </p>
      </Card>
    );
  }

  const groups = groupNotifications(items);

  return (
    <div className="space-y-6">
      {groups.map(({ group, items: groupItems }) => (
        <section key={group} className="space-y-3">
          <h2
            className={`text-xs font-semibold uppercase tracking-wider ${
              group === "action" ? "text-accent-amber" : "text-muted"
            }`}
          >
            {TIME_GROUP_LABELS[group]}
          </h2>
          <ul className="space-y-3">
            {groupItems.map((item) => (
              <li key={item.id}>
                <NotificationItemRow
                  item={item}
                  markReadAction={markReadAction}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="py-2 text-center text-xs text-subtle">No more notifications</p>
    </div>
  );
}
