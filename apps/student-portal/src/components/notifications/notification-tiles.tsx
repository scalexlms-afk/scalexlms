"use client";

import {
  Bell,
  ClipboardText,
  Megaphone,
  WarningCircle,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type { NotificationSummary } from "@/lib/notifications-shared";

const TILES = [
  {
    key: "unread" as const,
    label: "Unread",
    icon: Bell,
    iconClass: "bg-scalex-red/15 text-scalex-red",
    valueClass: "text-scalex-red",
  },
  {
    key: "actionRequired" as const,
    label: "Action Required",
    icon: WarningCircle,
    iconClass: "bg-accent-amber/15 text-accent-amber",
    valueClass: "text-accent-amber",
  },
  {
    key: "reviewsPending" as const,
    label: "Reviews Pending",
    icon: ClipboardText,
    iconClass: "bg-accent-green/15 text-accent-green",
    valueClass: "text-accent-green",
  },
  {
    key: "announcements" as const,
    label: "Announcements",
    icon: Megaphone,
    iconClass: "bg-accent-blue/15 text-accent-blue",
    valueClass: "text-accent-blue",
  },
];

export function NotificationTiles({ summary }: { summary: NotificationSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {TILES.map((tile) => {
        const Icon = tile.icon;
        return (
          <Card key={tile.key} className="!p-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile.iconClass}`}
              >
                <Icon weight="duotone" className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {tile.label}
                </p>
                <p
                  className={`mt-0.5 font-display text-2xl font-bold ${tile.valueClass}`}
                >
                  {summary[tile.key]}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
