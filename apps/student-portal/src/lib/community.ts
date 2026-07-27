import { createClient } from "@scalex/db/server";
import {
  getCommunityPosts,
  getUpcomingSessions,
  type CommunityPost,
  type LiveSession,
} from "@/lib/data";

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

export async function getTopContributors(
  limit = 5
): Promise<CommunityContributor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_posts")
    .select("author_id, profiles:author_id(name, avatar_url, plan, level)")
    .eq("status", "approved")
    .limit(300);

  if (!data || data.length === 0) return [];

  type Row = {
    author_id: string;
    profiles: {
      name: string;
      avatar_url?: string | null;
      plan?: string | null;
      level?: string | null;
    } | null;
  };

  const counts = new Map<
    string,
    { count: number; profile: Row["profiles"] }
  >();

  for (const row of data as Row[]) {
    const existing = counts.get(row.author_id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(row.author_id, { count: 1, profile: row.profiles });
    }
  }

  return [...counts.entries()]
    .map(([id, { count, profile }]) => ({
      id,
      name: profile?.name ?? "Member",
      avatarUrl: profile?.avatar_url ?? null,
      plan: profile?.plan ?? null,
      level: profile?.level ?? null,
      postCount: count,
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
}

export async function getCommunityRailData(
  userId: string
): Promise<CommunityRailData> {
  const [latestForTrending, announcements, upcomingSessions, topContributors] =
    await Promise.all([
      getCommunityPosts("latest", userId, 40),
      getCommunityPosts("announcements", userId, 3),
      getUpcomingSessions(userId, 3),
      getTopContributors(5),
    ]);

  const trending = [...latestForTrending]
    .filter((post) => post.status === "approved")
    .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    .slice(0, 5);

  return {
    trending,
    announcements,
    upcomingSessions,
    topContributors,
  };
}

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
  const trimmed = content.trim();
  const newline = trimmed.indexOf("\n");
  if (newline === -1) {
    return { title: null, body: trimmed };
  }
  return {
    title: trimmed.slice(0, newline).trim(),
    body: trimmed.slice(newline + 1).trim(),
  };
}
