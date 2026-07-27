import { getNotifications, type Notification } from "@/lib/data";
import { ensureNotificationPreferences } from "@/lib/settings";
import {
  isActionRequired,
  isAnnouncement,
  isReviewsPending,
  notificationCategory,
  notificationCtaLabel,
  notificationHref,
  type NotificationItem,
  type NotificationsPageData,
  type NotificationSummary,
} from "@/lib/notifications-shared";

export type {
  NotificationCategory,
  NotificationFilter,
  NotificationItem,
  NotificationSummary,
  NotificationsPageData,
  NotificationPrefs,
} from "@/lib/notifications-shared";
export {
  NOTIFICATION_FILTERS,
  TIME_GROUP_LABELS,
  filterNotifications,
  formatNotificationTime,
  groupNotifications,
  isActionRequired,
  notificationCategory,
  notificationCtaLabel,
  notificationHref,
  notificationTimeGroup,
} from "@/lib/notifications-shared";

function asPayload(
  value: Notification["payload"]
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function mapNotification(row: Notification): NotificationItem {
  const payload = asPayload(row.payload);
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
    category: notificationCategory(row.type),
    href: notificationHref(row.type, payload),
    ctaLabel: notificationCtaLabel(row.type),
    actionRequired: isActionRequired(row.type, row.read_at),
  };
}

function buildSummary(items: NotificationItem[]): NotificationSummary {
  return {
    unread: items.filter((n) => !n.readAt).length,
    actionRequired: items.filter((n) => n.actionRequired).length,
    reviewsPending: items.filter((n) =>
      isReviewsPending(n.type, n.readAt)
    ).length,
    announcements: items.filter((n) => isAnnouncement(n.type) && !n.readAt)
      .length,
  };
}

export async function getNotificationsPageData(
  userId: string
): Promise<NotificationsPageData> {
  const [rows, prefs] = await Promise.all([
    getNotifications(userId, 50),
    ensureNotificationPreferences(userId),
  ]);
  const notifications = rows.map(mapNotification);
  return {
    notifications,
    summary: buildSummary(notifications),
    prefs: {
      inApp: prefs.inApp,
      email: prefs.email,
    },
  };
}
