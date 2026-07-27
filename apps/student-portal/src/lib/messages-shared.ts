/** Client-safe Mentor Chat types & helpers — no server imports. */

export type ChatMessageRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at?: string | null;
  sender?: { name: string } | null;
};

export type MentorSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type SubmissionStatusKey =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "revision_required";

export type RecentSubmissionItem = {
  id: string;
  taskId: string;
  taskTitle: string;
  status: SubmissionStatusKey;
  submittedAt: string | null;
  updatedAt: string;
};

export type MessagesLearningContext = {
  courseTitle: string;
  milestoneTitle: string;
  milestoneIndex: number;
  milestoneTotal: number;
  currentLessonTitle: string | null;
  currentTaskTitle: string | null;
  continueHref: string;
  completionPercent: number;
};

export type MessagesPageData = {
  userId: string;
  mentor: MentorSummary;
  messages: ChatMessageRow[];
  unreadFromMentor: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  context: MessagesLearningContext;
  recentSubmissions: RecentSubmissionItem[];
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatusKey, string> = {
  not_started: "Not Started",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  revision_required: "Revision Required",
};

export function submissionStatusLabel(status: SubmissionStatusKey) {
  return SUBMISSION_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function submissionStatusVariant(
  status: SubmissionStatusKey
): "not_started" | "pending" | "review" | "approved" | "revision" {
  const map: Record<
    SubmissionStatusKey,
    "not_started" | "pending" | "review" | "approved" | "revision"
  > = {
    not_started: "not_started",
    submitted: "pending",
    under_review: "review",
    approved: "approved",
    revision_required: "revision",
  };
  return map[status];
}

/** Short clock time for chat bubbles, e.g. "10:30 AM". */
export function formatMessageClock(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative / short time for conversation list rows. */
export function formatThreadTime(value: string, nowMs = Date.now()) {
  const date = new Date(value);
  const diffMs = nowMs - date.getTime();
  const dayMs = 86_400_000;

  if (diffMs < dayMs && date.getDate() === new Date(nowMs).getDate()) {
    return formatMessageClock(value);
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

export function truncatePreview(text: string, max = 72) {
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
