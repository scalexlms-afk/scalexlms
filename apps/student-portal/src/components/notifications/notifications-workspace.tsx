"use client";

import { useState, useTransition } from "react";
import { NotificationsHero } from "@/components/notifications/notifications-hero";
import { NotificationTiles } from "@/components/notifications/notification-tiles";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { NotificationFeed } from "@/components/notifications/notification-feed";
import { NotificationsRail } from "@/components/notifications/notifications-rail";
import {
  buildNotificationSummary,
  filterNotifications,
  type NotificationFilter,
  type NotificationsPageData,
} from "@/lib/notifications-shared";

export function NotificationsWorkspace({
  data,
  markReadAction,
  markAllAction,
  togglePreferenceAction,
}: {
  data: NotificationsPageData;
  markReadAction: (formData: FormData) => Promise<void>;
  markAllAction: () => Promise<void>;
  togglePreferenceAction: (formData: FormData) => Promise<void>;
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [pending, startTransition] = useTransition();

  const summary = buildNotificationSummary(data.notifications);
  const filtered = filterNotifications(data.notifications, filter);

  function handleMarkAll() {
    startTransition(async () => {
      await markAllAction();
    });
  }

  function handleViewActionItems() {
    setFilter("unread");
  }

  return (
    <div className="notifications-theme space-y-6">
      <NotificationsHero
        unreadCount={summary.unread}
        onMarkAll={handleMarkAll}
        markingAll={pending}
      />

      <NotificationTiles summary={summary} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <NotificationFilters
            active={filter}
            unreadCount={summary.unread}
            onChange={setFilter}
          />
          <NotificationFeed items={filtered} markReadAction={markReadAction} />
        </div>

        <NotificationsRail
          summary={summary}
          prefs={data.prefs}
          togglePreferenceAction={togglePreferenceAction}
          onViewActionItems={handleViewActionItems}
        />
      </div>
    </div>
  );
}
