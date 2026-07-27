"use client";

import { useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type { NotificationSummary } from "@/lib/notifications-shared";

const PREF_ROWS = [
  { id: "inApp", label: "In-App", defaultOn: true },
  { id: "email", label: "Email", defaultOn: true },
  { id: "browser", label: "Browser", defaultOn: true },
  { id: "whatsapp", label: "WhatsApp", defaultOn: false },
  { id: "push", label: "Push Notifications", defaultOn: true },
] as const;

function DisabledToggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed rounded-full opacity-60 ${
        on ? "bg-accent-purple" : "bg-surface-3"
      }`}
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
  onViewActionItems,
}: {
  summary: NotificationSummary;
  onViewActionItems: () => void;
}) {
  const [tipsDismissed, setTipsDismissed] = useState(false);

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card id="notification-preferences" className="border-accent-purple/20">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Notification Preferences
          </p>
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-subtle">
            Coming soon
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {PREF_ROWS.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                {row.id === "whatsapp" ? (
                  <p className="text-[11px] text-subtle">Coming soon</p>
                ) : null}
              </div>
              <DisabledToggle on={row.defaultOn} />
            </li>
          ))}
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

      {!tipsDismissed ? (
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Notification Tips
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>· Check action items daily so reviews never stall.</li>
            <li>· Mentor replies and live class alerts are highest priority.</li>
            <li>· Prefer email digests? Preferences are coming soon.</li>
          </ul>
          <button
            type="button"
            onClick={() => setTipsDismissed(true)}
            className="mt-4 w-full rounded-xl border border-line bg-surface-3/50 px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-3 hover:text-foreground"
          >
            Got it, thanks!
          </button>
        </Card>
      ) : null}
    </aside>
  );
}
