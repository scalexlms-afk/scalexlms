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

export type NotificationPrefs = {
  inApp: boolean;
  email: boolean;
};

export type NotificationsPageData = {
  notifications: NotificationItem[];
  summary: NotificationSummary;
  prefs: NotificationPrefs;
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

export function isUnread(readAt: string | null | undefined): boolean {
  if (readAt == null) return true;
  const t = String(readAt).trim();
  if (!t || t === "null" || t === "undefined" || t === "0") return true;
  const parsed = Date.parse(t);
  return Number.isNaN(parsed);
}

function typeMatches(type: string, exact: Set<string>, needles: string[]): boolean {
  if (exact.has(type)) return true;
  const t = type.toLowerCase();
  return needles.some((n) => t.includes(n));
}

export function notificationCategory(type: string): NotificationCategory {
  if (typeMatches(type, TASK_TYPES, ["submission", "review", "milestone", "task"]))
    return "tasks";
  if (typeMatches(type, MENTOR_TYPES, ["message", "mentor", "chat"])) return "mentor";
  if (typeMatches(type, LIVE_TYPES, ["session", "live", "class"])) return "live";
  if (typeMatches(type, COMMUNITY_TYPES, ["community", "moderation"]))
    return "community";
  if (PAYMENT_TYPES.has(type) || type.startsWith("payment_")) return "payments";
  if (typeMatches(type, SYSTEM_TYPES, ["badge", "support", "ticket", "system"]))
    return "system";
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
  return (
    isUnread(readAt) &&
    typeMatches(type, ACTION_REQUIRED_TYPES, [
      "review",
      "message",
      "session",
      "payment_reminder",
      "payment_failed",
      "payment_overdue",
      "support",
      "revision",
    ])
  );
}

export function isReviewsPending(type: string, readAt: string | null): boolean {
  return (
    isUnread(readAt) &&
    typeMatches(type, new Set(["submission_review"]), ["review", "revision"])
  );
}

export function isAnnouncement(type: string): boolean {
  return typeMatches(
    type,
    new Set([
      "milestone_unlocked",
      "session_scheduled",
      "community_moderation",
      "plan_upgrade",
    ]),
    ["announcement", "milestone", "session", "community", "upgrade"]
  );
}

export function buildNotificationSummary(
  items: NotificationItem[]
): NotificationSummary {
  return {
    unread: items.filter((n) => isUnread(n.readAt)).length,
    actionRequired: items.filter((n) => n.actionRequired || isActionRequired(n.type, n.readAt)).length,
    reviewsPending: items.filter((n) => isReviewsPending(n.type, n.readAt)).length,
    announcements: items.filter((n) => isAnnouncement(n.type) && isUnread(n.readAt)).length,
  };
}

export type NotificationTimeGroup =
  | "action"
  | "today"
  | "yesterday"
  | "week"
  | "older";

export const TIME_GROUP_LABELS: Record<NotificationTimeGroup, string> = {
  action: "ACTION REQUIRED",
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
  if (filter === "unread") return items.filter((n) => isUnread(n.readAt));
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
