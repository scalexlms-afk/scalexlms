import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminNotifications } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { Button } from "@scalex/ui";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions";

export default async function NotificationsPage() {
  const { userId } = await requireAdminProfile();
  const notifications = await getAdminNotifications(userId, 100);
  const unread = notifications.filter((item) => !item.read_at).length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Notifications"
        description="In-app alerts for reviews, community, and student activity."
      />

      {unread > 0 ? (
        <form action={markAllNotificationsRead}>
          <Button type="submit" size="sm" variant="secondary">
            Mark all as read ({unread})
          </Button>
        </form>
      ) : null}

      <AdminPanel title={`${notifications.length} notification${notifications.length === 1 ? "" : "s"}`}>
        {notifications.length === 0 ? (
          <AdminEmptyState
            title="No notifications yet"
            hint="Task submissions, community posts, and student messages will appear here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {notifications.map((item) => (
              <li
                key={item.id}
                className={`flex flex-wrap items-start justify-between gap-3 py-4 first:pt-0 last:pb-0 ${
                  item.read_at ? "opacity-70" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  {item.body ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                      {item.body}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-subtle">
                    {formatDateTime(item.created_at)}
                    {item.read_at ? " · Read" : " · Unread"}
                  </p>
                </div>
                {!item.read_at ? (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" size="sm" variant="secondary">
                      Mark read
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </>
  );
}
