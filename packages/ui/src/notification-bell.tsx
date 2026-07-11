import type { ReactNode } from "react";

interface NotificationBellProps {
  notifications: {
    id: string;
    title: string;
    body: string | null;
    read_at: string | null;
    created_at: string;
  }[];
  markReadAction?: (formData: FormData) => Promise<void>;
}

export function NotificationBell({
  notifications,
  markReadAction,
}: NotificationBellProps) {
  const unread = notifications.filter((n) => !n.read_at);

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-secondary-dark transition-colors hover:bg-scalex-charcoal-alt hover:text-text-primary-dark">
        <span aria-hidden="true">🔔</span>
        {unread.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-scalex-red px-1 text-[10px] font-bold text-white">
            {unread.length}
          </span>
        )}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-80 rounded-[var(--radius-card)] border border-white/[0.06] bg-scalex-charcoal p-2 shadow-xl">
        <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary-dark">
          Notifications
        </p>
        {notifications.length === 0 ? (
          <p className="px-2 py-3 text-sm text-text-secondary-dark">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`rounded-lg px-2 py-2 text-sm ${
                  n.read_at
                    ? "text-text-secondary-dark"
                    : "bg-scalex-charcoal-alt text-text-primary-dark"
                }`}
              >
                <p className="font-medium">{n.title}</p>
                {n.body && (
                  <p className="mt-0.5 text-xs text-text-secondary-dark">
                    {n.body}
                  </p>
                )}
                {!n.read_at && markReadAction && (
                  <form action={markReadAction} className="mt-1">
                    <input type="hidden" name="id" value={n.id} />
                    <button
                      type="submit"
                      className="text-xs text-scalex-red hover:underline"
                    >
                      Mark read
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

export function BadgeMedallion({
  label,
  earned = true,
}: {
  label: string;
  earned?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 ${earned ? "" : "opacity-40"}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl ${
          earned
            ? "border-accent-gold bg-scalex-charcoal text-accent-gold shadow-[0_0_20px_-4px_rgba(255,201,74,0.5)]"
            : "border-white/15 bg-scalex-charcoal-alt text-text-tertiary-dark"
        }`}
      >
        🏆
      </div>
      <p className="max-w-[80px] text-center text-xs font-medium text-text-secondary-dark">
        {label}
      </p>
    </div>
  );
}
