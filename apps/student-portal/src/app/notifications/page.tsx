import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { markNotificationRead } from "@/app/notifications/actions";
import { Card } from "@scalex/ui";

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function NotificationsPage() {
  const { userId } = await requireStudentProfile();
  const notifications = await getNotifications(userId, 50);

  return (
    <PortalShell activePath="/notifications">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-muted">
            Reviews, community updates, and account alerts in one place.
          </p>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">You&apos;re all caught up.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id}>
                <Card
                  className={
                    n.read_at ? "opacity-80" : "border-scalex-red/30 bg-scalex-red/5"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{n.title}</p>
                      {n.body && (
                        <p className="mt-1 text-sm text-muted">{n.body}</p>
                      )}
                      <p className="mt-2 text-xs text-subtle">
                        {formatWhen(n.created_at)}
                      </p>
                    </div>
                    {!n.read_at && (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-3"
                        >
                          Mark read
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PortalShell>
  );
}
