"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChatCircle,
  CheckSquare,
  CurrencyDollar,
  Megaphone,
  Robot,
  SealCheck,
  Ticket,
  Trophy,
  VideoCamera,
  WarningCircle,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  formatNotificationTime,
  type NotificationItem,
} from "@/lib/notifications-shared";

function iconForType(type: string) {
  switch (type) {
    case "submission_review":
      return { Icon: CheckSquare, className: "bg-scalex-red/15 text-scalex-red" };
    case "milestone_unlocked":
      return { Icon: Megaphone, className: "bg-accent-blue/15 text-accent-blue" };
    case "badge_earned":
      return { Icon: Trophy, className: "bg-accent-green/15 text-accent-green" };
    case "message":
      return { Icon: ChatCircle, className: "bg-accent-blue/15 text-accent-blue" };
    case "session_scheduled":
      return {
        Icon: VideoCamera,
        className: "bg-accent-amber/15 text-accent-amber",
      };
    case "community_moderation":
      return { Icon: WarningCircle, className: "bg-accent-amber/15 text-accent-amber" };
    case "support_ticket":
      return { Icon: Ticket, className: "bg-accent-blue/15 text-accent-blue" };
    case "payment_success":
    case "enrollment":
    case "plan_upgrade":
      return {
        Icon: CurrencyDollar,
        className: "bg-accent-green/15 text-accent-green",
      };
    case "payment_reminder":
    case "payment_failed":
    case "payment_overdue":
      return {
        Icon: CurrencyDollar,
        className: "bg-accent-amber/15 text-accent-amber",
      };
    default:
      if (type.startsWith("payment_")) {
        return {
          Icon: CurrencyDollar,
          className: "bg-accent-green/15 text-accent-green",
        };
      }
      return { Icon: Robot, className: "bg-accent-purple/15 text-accent-purple" };
  }
}

export function NotificationItemRow({
  item,
  markReadAction,
}: {
  item: NotificationItem;
  markReadAction: (formData: FormData) => Promise<void>;
}) {
  const { Icon, className } = iconForType(item.type);
  const unread = !item.readAt;

  return (
    <Card
      className={`!p-0 overflow-hidden ${
        unread
          ? "border-accent-purple/30 bg-accent-purple/5"
          : "border-line opacity-90"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
        >
          <Icon weight="duotone" className="h-5 w-5" aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">
                {unread ? (
                  <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent-purple align-middle" />
                ) : null}
                {item.title}
              </p>
              {item.body ? (
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              ) : null}
            </div>
            <p className="shrink-0 text-xs text-subtle">
              {formatNotificationTime(item.createdAt)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-purple/15 px-3 py-1.5 text-xs font-semibold text-accent-purple transition hover:bg-accent-purple/25"
            >
              {item.ctaLabel}
              <ArrowRight weight="bold" className="h-3.5 w-3.5" aria-hidden />
            </Link>
            {unread ? (
              <form action={markReadAction}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-surface-3 hover:text-foreground"
                >
                  Mark read
                </button>
              </form>
            ) : null}
            {item.actionRequired ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-amber/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-amber">
                <SealCheck weight="fill" className="h-3 w-3" aria-hidden />
                Action
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
