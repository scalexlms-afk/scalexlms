import { getNotifications, type Notification } from "@/lib/data";
import { ensureNotificationPreferences } from "@/lib/settings";
import {
  buildNotificationSummary,
  isActionRequired,
  isUnread,
  notificationCategory,
  notificationCtaLabel,
  notificationHref,
  type NotificationItem,
  type NotificationsPageData,
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
  buildNotificationSummary,
  filterNotifications,
  formatNotificationTime,
  groupNotifications,
  isActionRequired,
  isUnread,
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
  const readAt = isUnread(row.read_at) ? null : row.read_at;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    readAt,
    category: notificationCategory(row.type),
    href: notificationHref(row.type, payload),
    ctaLabel: notificationCtaLabel(row.type),
    actionRequired: isActionRequired(row.type, readAt),
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
    summary: buildNotificationSummary(notifications),
    prefs: {
      inApp: prefs.inApp,
      email: prefs.email,
    },
  };
}
