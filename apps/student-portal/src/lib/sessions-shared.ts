/** Client-safe Live Sessions types & helpers — no server imports. */

export const SESSION_TYPE_LABELS: Record<string, string> = {
  batch_class: "Batch Class",
  masterclass: "Masterclass",
  qa: "Q&A",
  case_study: "Case Study",
};

export type SessionListItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  meeting_url: string | null;
  registered: boolean;
  hostName: string | null;
  hostAvatarUrl: string | null;
  registrationCount: number;
};

export type RecordingListItem = {
  id: string;
  type: string;
  title: string;
  scheduled_at: string;
  secureRecordingUrl: string | null;
};

export type SessionsPageData = {
  upcoming: SessionListItem[];
  recordings: RecordingListItem[];
  registeredUpcoming: SessionListItem[];
  watermark: string;
};

export function sessionTypeLabel(type: string) {
  return SESSION_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}

export function formatSessionDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSessionDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatSessionTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

export function getCountdownParts(
  scheduledAt: string,
  nowMs = Date.now()
): CountdownParts {
  const totalMs = Math.max(0, new Date(scheduledAt).getTime() - nowMs);
  const seconds = Math.floor(totalMs / 1000) % 60;
  const minutes = Math.floor(totalMs / 60_000) % 60;
  const hours = Math.floor(totalMs / 3_600_000) % 24;
  const days = Math.floor(totalMs / 86_400_000);
  return { days, hours, minutes, seconds, totalMs };
}

/** Local calendar day key YYYY-MM-DD for session dots. */
export function localDayKey(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
