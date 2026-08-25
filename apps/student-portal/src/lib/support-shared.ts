/** Client-safe Support types & helpers — no server imports. */

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "normal" | "high";

export type SupportTicketItem = {
  id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  staffReply: string | null;
  staffReplyAt: string | null;
  createdAt: string;
};

export type SupportMentorSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type ConversationPreviewData = {
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadFromMentor: number;
};

export type SupportPageData = {
  userId: string;
  plan: string | null;
  premium: boolean;
  hasMentor: boolean;
  mentor: SupportMentorSummary | null;
  tickets: SupportTicketItem[];
  conversation: ConversationPreviewData | null;
  contact: {
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
  };
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function ticketStatusLabel(status: TicketStatus | string) {
  if (status in TICKET_STATUS_LABELS) {
    return TICKET_STATUS_LABELS[status as TicketStatus];
  }
  return String(status).replace(/_/g, " ");
}

export function ticketStatusVariant(
  status: TicketStatus | string
): "pending" | "review" | "approved" | "neutral" | "inactive" {
  switch (status) {
    case "open":
      return "pending";
    case "in_progress":
      return "review";
    case "resolved":
      return "approved";
    case "closed":
      return "inactive";
    default:
      return "neutral";
  }
}

/** Short display id e.g. #TK-A1B2 */
export function formatTicketId(id: string) {
  const short = id.replace(/-/g, "").slice(-4).toUpperCase();
  return `#TK-${short}`;
}

/** Absolute-ish date for ticket rows, e.g. "Jul 20, 2026". */
export function formatTicketDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Relative / short time for conversation preview rows. */
export function formatSupportThreadTime(value: string, nowMs = Date.now()) {
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

export function truncateSupportPreview(text: string, max = 88) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function mentorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
