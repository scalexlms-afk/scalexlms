"use client";

import Link from "next/link";
import { ChatCircle, Heart } from "@phosphor-icons/react";
import { planLabel, planPillVariant, LEVEL_LABELS } from "@scalex/db";
import { Card, Button, StatusPill } from "@scalex/ui";
import {
  COMMUNITY_CHANNELS,
  formatCommunityRelative,
  postSnippet,
  type CommunityChannel,
  type CommunityPost,
} from "@/lib/community-shared";
import {
  addCommentAction,
  toggleLikeAction,
} from "@/app/(portal)/community/actions";

function channelLabel(channel: string) {
  return (
    COMMUNITY_CHANNELS.find((c) => c.key === channel)?.label ??
    channel.replace(/_/g, " ")
  );
}

function isStaffRole(role?: string | null) {
  return role === "mentor" || role === "instructor" || role === "super_admin";
}

function AuthorAvatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${dim} rounded-full object-cover ring-1 ring-line`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-accent-purple/20 font-semibold text-accent-purple ring-1 ring-line ${dim}`}
    >
      {initial}
    </div>
  );
}

const commentInput =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export function PostCard({
  post,
  activeChannel,
}: {
  post: CommunityPost;
  activeChannel: CommunityChannel | "latest";
}) {
  const name = post.profiles?.name ?? "Member";
  const comments = post.comments ?? [];
  const previewComments = comments.slice(-2);
  const staff = isStaffRole(post.profiles?.role);
  const { title, body } = postSnippet(post.content);
  const levelLabel = post.profiles?.level
    ? (LEVEL_LABELS[post.profiles.level] ?? post.profiles.level)
    : null;
  const solved = comments.some((c) => isStaffRole(c.profiles?.role));

  return (
    <Card className="!p-0 overflow-hidden border-line bg-surface-2/40">
      <div className="p-4 sm:p-5">
        <div className="flex gap-3">
          <AuthorAvatar name={name} avatarUrl={post.profiles?.avatar_url} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{name}</p>
              {staff && (
                <StatusPill
                  label={
                    post.profiles?.role === "mentor" ? "Mentor" : "Staff"
                  }
                  variant="active"
                />
              )}
              {!staff && levelLabel && (
                <StatusPill label={levelLabel} variant="neutral" />
              )}
              {!staff && !levelLabel && post.profiles?.plan && (
                <StatusPill
                  label={planLabel(post.profiles.plan, true)}
                  variant={planPillVariant(post.profiles.plan)}
                />
              )}
              {solved ? (
                <StatusPill label="Solved" variant="approved" />
              ) : null}
              <span className="text-xs text-subtle">
                · {formatCommunityRelative(post.created_at)}
              </span>
              <span className="inline-flex items-center rounded-full bg-accent-purple/10 px-2 py-0.5 text-[11px] font-semibold text-accent-purple">
                {channelLabel(post.channel)}
              </span>
              {post.status === "pending_approval" && (
                <StatusPill label="Pending" variant="pending" />
              )}
            </div>

            <Link href={`/community/${post.id}`} className="mt-2 block">
              {title ? (
                <>
                  <p className="text-[15px] font-semibold leading-relaxed text-foreground hover:opacity-90">
                    {title}
                  </p>
                  {body ? (
                    <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">
                      {body}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground hover:opacity-90">
                  {body}
                </p>
              )}
            </Link>

            {(post.media_urls?.length ?? 0) > 0 && (
              <div
                className={`mt-3 grid gap-2 ${
                  (post.media_urls?.length ?? 0) > 1
                    ? "sm:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {post.media_urls?.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="max-h-80 w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-5">
              <form action={toggleLikeAction}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="channel" value={activeChannel} />
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    post.liked_by_user
                      ? "text-accent-purple"
                      : "text-muted hover:text-accent-purple"
                  }`}
                >
                  <Heart
                    weight={post.liked_by_user ? "fill" : "regular"}
                    className="h-4 w-4"
                    aria-hidden
                  />
                  {post.like_count}
                </button>
              </form>
              <Link
                href={`/community/${post.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent-purple"
              >
                <ChatCircle weight="duotone" className="h-4 w-4" aria-hidden />
                {post.comment_count ?? comments.length}
              </Link>
            </div>

            {previewComments.length > 0 && (
              <ul className="mt-3 space-y-2 rounded-xl bg-surface-3/50 px-3 py-2">
                {previewComments.map((comment) => (
                  <li key={comment.id} className="flex gap-2">
                    <AuthorAvatar
                      name={comment.profiles?.name ?? "Member"}
                      avatarUrl={comment.profiles?.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">
                        {comment.profiles?.name ?? "Member"}{" "}
                        <span className="font-normal text-subtle">
                          {formatCommunityRelative(comment.created_at)}
                        </span>
                      </p>
                      <p className="text-sm text-muted">{comment.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {post.status === "approved" && (
              <form action={addCommentAction} className="mt-3 flex gap-2">
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="channel" value={activeChannel} />
                <input
                  name="content"
                  required
                  placeholder="Write a comment…"
                  className={commentInput}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  className="!border-accent-purple/40 !text-accent-purple hover:!bg-accent-purple/10"
                >
                  Reply
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function PostFeed({
  posts,
  activeChannel,
  emptyMessage = "No posts yet. Be the first to share!",
}: {
  posts: CommunityPost[];
  activeChannel: CommunityChannel | "latest";
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-muted">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} activeChannel={activeChannel} />
      ))}
    </div>
  );
}
