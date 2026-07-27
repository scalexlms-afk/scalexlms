"use client";

import { useTransition } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type {
  NotificationPrefs,
  NotificationSummary,
} from "@/lib/notifications-shared";

type PrefRow = {
  id: "inApp" | "email" | "browser" | "whatsapp" | "push";
  channel?: "in_app" | "email";
  label: string;
  available: boolean;
};

const PREF_ROWS: PrefRow[] = [
  { id: "inApp", channel: "in_app", label: "In-App", available: true },
  { id: "email", channel: "email", label: "Email", available: true },
  { id: "browser", label: "Browser", available: false },
  { id: "whatsapp", label: "WhatsApp", available: false },
  { id: "push", label: "Push Notifications", available: false },
];

function Toggle({
  on,
  disabled,
  pending,
}: {
  on: boolean;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
        disabled || pending ? "cursor-not-allowed opacity-60" : ""
      } ${on ? "bg-accent-purple" : "bg-surface-3"}`}
      aria-hidden
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </span>
  );
}

export function NotificationsRail({
  summary,
  prefs,
  togglePreferenceAction,
  onViewActionItems,
}: {
  summary: NotificationSummary;
  prefs: NotificationPrefs;
  togglePreferenceAction: (formData: FormData) => Promise<void>;
  onViewActionItems: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function currentOn(id: PrefRow["id"]) {
    if (id === "inApp") return prefs.inApp;
    if (id === "email") return prefs.email;
    return false;
  }

  function onToggle(channel: "in_app" | "email", next: boolean) {
    const fd = new FormData();
    fd.set("channel", channel);
    fd.set("enabled", next ? "true" : "false");
    startTransition(async () => {
      await togglePreferenceAction(fd);
    });
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card id="notification-preferences" className="border-accent-purple/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Notification Preferences
          </p>
        </div>
        <p className="mt-2 text-[11px] text-subtle">
          Payment and security alerts always stay on.
        </p>
        <ul className="mt-4 space-y-3">
          {PREF_ROWS.map((row) => {
            const on = currentOn(row.id);
            return (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {row.label}
                  </p>
                  {!row.available ? (
                    <p className="text-[11px] text-subtle">Not available yet</p>
                  ) : null}
                </div>
                {row.available && row.channel ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onToggle(row.channel!, !on)}
                    aria-pressed={on}
                    aria-label={`Toggle ${row.label}`}
                    className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
                  >
                    <Toggle on={on} pending={pending} />
                  </button>
                ) : (
                  <Toggle on={false} disabled />
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="border-accent-purple/35 bg-gradient-to-br from-accent-purple/12 via-surface-2 to-surface-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Notification Summary
          </p>
          <span className="rounded-full bg-accent-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-purple">
            Beta
          </span>
        </div>
        <p className="mt-3 text-sm text-foreground">
          {summary.actionRequired > 0
            ? `You have ${summary.actionRequired} important notification${
                summary.actionRequired === 1 ? "" : "s"
              } that need your attention.`
            : "No urgent items right now — you're clear on action items."}
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li>
            · {summary.reviewsPending} task
            {summary.reviewsPending === 1 ? "" : "s"} need review
          </li>
          <li>
            · {summary.unread} unread notification
            {summary.unread === 1 ? "" : "s"}
          </li>
          <li>
            · {summary.announcements} announcement
            {summary.announcements === 1 ? "" : "s"}
          </li>
        </ul>
        <button
          type="button"
          onClick={onViewActionItems}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
        >
          <Sparkle weight="fill" className="h-4 w-4" aria-hidden />
          View Action Items
        </button>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Notification Tips
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li>· Check action items daily so reviews never stall.</li>
          <li>· Mentor replies and live class alerts are highest priority.</li>
          <li>· Turn off email digests anytime from preferences above.</li>
        </ul>
      </Card>
    </aside>
  );
}
