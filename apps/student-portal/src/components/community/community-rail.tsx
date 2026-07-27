"use client";

import Link from "next/link";
import {
  CalendarBlank,
  Fire,
  Megaphone,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { LEVEL_LABELS } from "@scalex/db";
import type {
  CommunityContributor,
  CommunityPost,
  CommunityRailData,
  LiveSession,
} from "@/lib/community-shared";
import {
  formatCommunityRelative,
  postSnippet,
} from "@/lib/community-shared";

function MiniAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string | null;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-semibold text-accent-purple ring-1 ring-line">
      {initial}
    </div>
  );
}

function formatSessionTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TrendingItem({ post }: { post: CommunityPost }) {
  const { title, body } = postSnippet(post.content);
  const label = title || body.slice(0, 80);
  return (
    <li>
      <Link
        href={`/community/${post.id}`}
        className="block rounded-xl px-2 py-2 transition hover:bg-surface-3/60"
      >
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {label}
          {!title && body.length > 80 ? "…" : ""}
        </p>
        <p className="mt-1 text-xs text-subtle">
          {post.like_count} likes · {formatCommunityRelative(post.created_at)}
        </p>
      </Link>
    </li>
  );
}

function AnnouncementItem({ post }: { post: CommunityPost }) {
  const { title, body } = postSnippet(post.content);
  return (
    <li>
      <Link
        href={`/community/${post.id}`}
        className="block rounded-xl border border-line bg-surface-3/40 px-3 py-2.5 transition hover:border-accent-purple/40 hover:bg-accent-purple/5"
      >
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {title || body}
        </p>
        <p className="mt-1 text-xs text-subtle">
          {formatCommunityRelative(post.created_at)}
        </p>
      </Link>
    </li>
  );
}

function SessionItem({
  session,
}: {
  session: LiveSession & { registered: boolean };
}) {
  return (
    <li className="rounded-xl border border-line bg-surface-3/40 px-3 py-2.5">
      <p className="text-sm font-medium text-foreground">{session.title}</p>
      <p className="mt-1 text-xs text-subtle">
        {formatSessionTime(session.scheduled_at)}
      </p>
      <Link
        href="/sessions"
        className="mt-2 inline-flex text-xs font-semibold text-accent-purple hover:underline"
      >
        Join →
      </Link>
    </li>
  );
}

function ContributorItem({
  contributor,
  rank,
}: {
  contributor: CommunityContributor;
  rank: number;
}) {
  const levelLabel = contributor.level
    ? (LEVEL_LABELS[contributor.level] ?? contributor.level)
    : null;

  return (
    <li className="flex items-center gap-2.5 px-2 py-1.5">
      <span className="w-4 text-xs font-semibold text-subtle">{rank}</span>
      <MiniAvatar name={contributor.name} avatarUrl={contributor.avatarUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {contributor.name}
        </p>
        <p className="text-xs text-subtle">
          {contributor.postCount} post{contributor.postCount === 1 ? "" : "s"}
          {levelLabel ? ` · ${levelLabel}` : ""}
        </p>
      </div>
    </li>
  );
}

export function CommunityRail({ data }: { data: CommunityRailData }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card className="border-accent-purple/20">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
            <Fire weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Trending Discussions
          </p>
        </div>
        {data.trending.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No trending posts yet.</p>
        ) : (
          <ul className="mt-2 space-y-0.5">
            {data.trending.map((post) => (
              <TrendingItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-amber/15 text-accent-amber">
            <Megaphone weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Announcements
          </p>
        </div>
        {data.announcements.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No announcements right now.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.announcements.map((post) => (
              <AnnouncementItem key={post.id} post={post} />
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/15 text-accent-blue">
            <CalendarBlank weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Upcoming Sessions
          </p>
        </div>
        {data.upcomingSessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No upcoming sessions.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.upcomingSessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}
          </ul>
        )}
        <Link
          href="/sessions"
          className="mt-3 inline-flex text-xs font-semibold text-accent-purple hover:underline"
        >
          View all sessions →
        </Link>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple">
            <UsersThree weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Top Contributors
          </p>
        </div>
        {data.topContributors.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No contributors yet.</p>
        ) : (
          <ul className="mt-3 space-y-0.5">
            {data.topContributors.map((contributor, index) => (
              <ContributorItem
                key={contributor.id}
                contributor={contributor}
                rank={index + 1}
              />
            ))}
          </ul>
        )}
        <Link
          href="/achievements"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-purple hover:underline"
        >
          <Trophy weight="duotone" className="h-3.5 w-3.5" aria-hidden />
          View Leaderboard
        </Link>
      </Card>
    </aside>
  );
}
