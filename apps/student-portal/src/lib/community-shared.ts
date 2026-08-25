/** Client-safe community types & helpers — no server imports. */

export type CommunityChannel =
  | "announcements"
  | "product_hunting"
  | "supplier_help"
  | "ppc_discussion"
  | "questions"
  | "student_wins";

export interface LiveSession {
  id: string;
  type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  host_id: string;
  meeting_url: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
  audience?: "all_premium" | "selected" | string | null;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url?: string | null;
    role?: string | null;
  } | null;
}

export interface CommunityPost {
  id: string;
  channel: CommunityChannel;
  author_id: string;
  content: string;
  status: "pending_approval" | "approved" | "rejected";
  like_count: number;
  media_urls?: string[];
  pinned?: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    avatar_url?: string | null;
    plan?: string | null;
    level?: string | null;
    role?: string | null;
  } | null;
  comments?: CommunityComment[];
  liked_by_user?: boolean;
  comment_count?: number;
}

export type CommunityContributor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  plan: string | null;
  level: string | null;
  postCount: number;
};

export type CommunityRailData = {
  trending: CommunityPost[];
  announcements: CommunityPost[];
  upcomingSessions: (LiveSession & { registered: boolean })[];
  topContributors: CommunityContributor[];
};

export const COMMUNITY_CHANNELS: { key: CommunityChannel; label: string }[] = [
  { key: "announcements", label: "Announcements" },
  { key: "product_hunting", label: "Product Hunting" },
  { key: "supplier_help", label: "Supplier Help" },
  { key: "ppc_discussion", label: "PPC Discussion" },
  { key: "questions", label: "Questions" },
  { key: "student_wins", label: "Student Wins" },
];

export function formatCommunityRelative(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function postSnippet(content: string): {
  title: string | null;
  body: string;
} {
  const cleaned = content
    .replace(/\n*\[seed:[^\]]+\]\s*$/i, "")
    .replace(/\n*\[Mock Seed\][^\n]*/gi, "")
    .trim();
  const newline = cleaned.indexOf("\n");
  if (newline === -1) {
    return { title: null, body: cleaned };
  }
  return {
    title: cleaned.slice(0, newline).trim(),
    body: cleaned.slice(newline + 1).trim(),
  };
}
