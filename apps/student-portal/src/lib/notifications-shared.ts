/** Client-safe Notifications types & helpers — no server imports. */

export type NotificationCategory =
  | "tasks"
  | "mentor"
  | "live"
  | "community"
  | "payments"
  | "system";

export type NotificationFilter = "all" | "unread" | NotificationCategory;

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  category: NotificationCategory;
  href: string;
  ctaLabel: string;
  actionRequired: boolean;
};

export type NotificationSummary = {
  unread: number;
  actionRequired: number;
  reviewsPending: number;
  announcements: number;
};

export type NotificationsPageData = {
  notifications: NotificationItem[];
  summary: NotificationSummary;
};

export const NOTIFICATION_FILTERS: Array<{
  id: NotificationFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "tasks", label: "Tasks" },
  { id: "mentor", label: "Mentor" },
  { id: "live", label: "Live Classes" },
  { id: "community", label: "Community" },
  { id: "payments", label: "Payments" },
  { id: "system", label: "System" },
];

const TASK_TYPES = new Set(["submission_review", "milestone_unlocked"]);
const MENTOR_TYPES = new Set(["message"]);
const LIVE_TYPES = new Set(["session_scheduled"]);
const COMMUNITY_TYPES = new Set(["community_moderation"]);
const PAYMENT_TYPES = new Set([
  "payment_success",
  "payment_reminder",
  "payment_failed",
  "payment_overdue",
  "enrollment",
  "plan_upgrade",
]);
const SYSTEM_TYPES = new Set(["badge_earned", "support_ticket"]);

const ACTION_REQUIRED_TYPES = new Set([
  "submission_review",
  "message",
  "session_scheduled",
  "payment_reminder",
  "payment_failed",
  "payment_overdue",
  "support_ticket",
]);

export function notificationCategory(type: string): NotificationCategory {
  if (TASK_TYPES.has(type)) return "tasks";
  if (MENTOR_TYPES.has(type)) return "mentor";
  if (LIVE_TYPES.has(type)) return "live";
  if (COMMUNITY_TYPES.has(type)) return "community";
  if (PAYMENT_TYPES.has(type) || type.startsWith("payment_")) return "payments";
  if (SYSTEM_TYPES.has(type)) return "system";
  return "system";
}

export function notificationHref(
  type: string,
  payload?: Record<string, unknown> | null
): string {
  const fromPayload =
    typeof payload?.href === "string"
      ? payload.href
      : typeof payload?.url === "string"
        ? payload.url
        : null;
  if (fromPayload) return fromPayload;

  switch (type) {
    case "submission_review":
      return "/tasks";
    case "milestone_unlocked":
      return "/roadmap";
    case "badge_earned":
      return "/achievements";
    case "message":
      return "/messages";
    case "session_scheduled":
      return "/sessions";
    case "community_moderation":
      return "/community";
    case "payment_reminder":
    case "payment_failed":
    case "payment_overdue":
      return "/payment?mode=remaining";
    case "payment_success":
    case "enrollment":
    case "plan_upgrade":
      return "/billing";
    case "support_ticket":
      return "/support";
    default:
      if (type.startsWith("payment_")) return "/billing";
      return "/notifications";
  }
}

export function notificationCtaLabel(type: string): string {
  switch (type) {
    case "submission_review":
      return "View Feedback";
    case "milestone_unlocked":
      return "Open Roadmap";
    case "badge_earned":
      return "View Achievement";
    case "message":
      return "Open Chat";
    case "session_scheduled":
      return "Join Session";
    case "community_moderation":
      return "Open Community";
    case "payment_reminder":
    case "payment_failed":
    case "payment_overdue":
      return "Pay Now";
    case "payment_success":
      return "View Receipt";
    case "enrollment":
    case "plan_upgrade":
      return "View Billing";
    case "support_ticket":
      return "Open Support";
    default:
      return "Open";
  }
}

export function isActionRequired(type: string, readAt: string | null): boolean {
  return !readAt && ACTION_REQUIRED_TYPES.has(type);
}

export function isReviewsPending(type: string, readAt: string | null): boolean {
  return !readAt && type === "submission_review";
}

export function isAnnouncement(type: string): boolean {
  return (
    type === "milestone_unlocked" ||
    type === "session_scheduled" ||
    type === "community_moderation" ||
    type === "plan_upgrade"
  );
}

export type NotificationTimeGroup =
  | "action"
  | "today"
  | "yesterday"
  | "week"
  | "older";

export const TIME_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  action: "Action Required",
  today: "Today",
  yesterday: "Yesterday",
  week: "This Week",
  older: "Earlier",
};

export function notificationTimeGroup(
  createdAt: string,
  actionRequired: boolean,
  nowMs = Date.now()
): NotificationTimeGroup {
  if (actionRequired) return "action";

  const date = new Date(createdAt);
  const now = new Date(nowMs);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const weekAgo = startOfToday - 7 * 86_400_000;
  const t = date.getTime();

  if (t >= startOfToday) return "today";
  if (t >= startOfYesterday) return "yesterday";
  if (t >= weekAgo) return "week";
  return "older";
}

export function formatNotificationTime(value: string, nowMs = Date.now()) {
  const date = new Date(value);
  const diffMs = nowMs - date.getTime();
  const dayMs = 86_400_000;

  if (diffMs < dayMs && date.getDate() === new Date(nowMs).getDate()) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (diffMs < 2 * dayMs) return "Yesterday";
  if (diffMs < 7 * dayMs) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function filterNotifications(
  items: NotificationItem[],
  filter: NotificationFilter
): NotificationItem[] {
  if (filter === "all") return items;
  if (filter === "unread") return items.filter((n) => !n.readAt);
  return items.filter((n) => n.category === filter);
}

export function groupNotifications(
  items: NotificationItem[],
  nowMs = Date.now()
): Array<{ group: NotificationTimeGroup; items: NotificationItem[] }> {
  const buckets: Record<NotificationTimeGroup, NotificationItem[]> = {
    action: [],
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };

  for (const item of items) {
    const group = notificationTimeGroup(
      item.createdAt,
      item.actionRequired,
      nowMs
    );
    buckets[group].push(item);
  }

  const order: NotificationTimeGroup[] = [
    "action",
    "today",
    "yesterday",
    "week",
    "older",
  ];

  return order
    .filter((g) => buckets[g].length > 0)
    .map((group) => ({ group, items: buckets[group] }));
}
