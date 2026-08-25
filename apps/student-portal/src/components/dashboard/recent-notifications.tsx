import Link from "next/link";
import { Card } from "@scalex/ui";
import type { NotificationItem } from "@/lib/notifications-shared";
import { formatNotificationTime } from "@/lib/notifications-shared";

export function RecentNotifications({
  items,
}: {
  items: NotificationItem[];
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">
          Recent notifications
        </h2>
        <Link
          href="/notifications"
          className="text-sm font-medium text-scalex-red hover:underline"
        >
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">You are all caught up.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block rounded-xl border border-transparent px-1 py-1 hover:border-line hover:bg-surface-3/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-xs text-subtle">
                    {formatNotificationTime(item.createdAt)}
                  </span>
                </div>
                {item.body ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {item.body}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
