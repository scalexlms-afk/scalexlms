import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import {
  COMMUNITY_CHANNELS,
  getCommunityPosts,
  type CommunityChannel,
  type CommunityPost,
} from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import { Card, Button, StatusPill } from "@scalex/ui";
import { inputClasses } from "@/components/field";
import {
  addCommentAction,
  createPostAction,
  toggleLikeAction,
} from "./actions";

function formatRelative(value: string) {
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
        className="h-11 w-11 rounded-full object-cover ring-1 ring-line"
      />
    );
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-scalex-red/20 text-sm font-semibold text-scalex-red ring-1 ring-line">
      {initial}
    </div>
  );
}

function PostCard({
  post,
  activeChannel,
}: {
  post: CommunityPost;
  activeChannel: string;
}) {
  const name = post.profiles?.name ?? "Member";
  const comments = post.comments ?? [];
  const previewComments = comments.slice(-2);
  const staff = isStaffRole(post.profiles?.role);

  return (
    <article className="border-b border-line py-5 last:border-b-0">
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
            {!staff && post.profiles?.plan && (
              <StatusPill
                label={planLabel(post.profiles.plan, true)}
                variant={planPillVariant(post.profiles.plan)}
              />
            )}
            <span className="text-xs text-subtle">
              · {formatRelative(post.created_at)}
            </span>
            {activeChannel === "latest" && (
              <StatusPill
                label={channelLabel(post.channel)}
                variant="neutral"
              />
            )}
            {post.status === "pending_approval" && (
              <StatusPill label="Pending" variant="pending" />
            )}
          </div>

          <Link href={`/community/${post.id}`} className="mt-2 block">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground hover:opacity-90">
              {post.content}
            </p>
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
                className={`text-sm font-medium transition-colors ${
                  post.liked_by_user
                    ? "text-scalex-red"
                    : "text-muted hover:text-scalex-red"
                }`}
              >
                {post.liked_by_user ? "♥" : "♡"} {post.like_count}
              </button>
            </form>
            <Link
              href={`/community/${post.id}`}
              className="text-sm text-muted hover:text-scalex-red"
            >
              💬 {post.comment_count ?? comments.length}
            </Link>
            <Link
              href={`/community/${post.id}`}
              className="text-sm text-subtle hover:text-foreground"
            >
              Open
            </Link>
          </div>

          {previewComments.length > 0 && (
            <ul className="mt-3 space-y-2 rounded-xl bg-surface-2/60 px-3 py-2">
              {previewComments.map((comment) => (
                <li key={comment.id} className="flex gap-2">
                  <AuthorAvatar
                    name={comment.profiles?.name ?? "Member"}
                    avatarUrl={comment.profiles?.avatar_url}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">
                      {comment.profiles?.name ?? "Member"}{" "}
                      <span className="font-normal text-subtle">
                        {formatRelative(comment.created_at)}
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
                className={inputClasses}
              />
              <Button type="submit" size="sm" variant="secondary">
                Reply
              </Button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; before?: string }>;
}) {
  const { userId } = await requireStudentProfile();
  const params = await searchParams;
  const activeChannel =
    params.channel === "latest" || !params.channel
      ? "latest"
      : (COMMUNITY_CHANNELS.find((item) => item.key === params.channel)?.key ??
        "latest");

  const posts = await getCommunityPosts(
    activeChannel as CommunityChannel | "latest",
    userId,
    15,
    params.before
  );
  const oldest = posts[posts.length - 1]?.created_at;
  const composerChannel =
    activeChannel === "latest" ? "questions" : activeChannel;

  return (
    <PortalShell activePath="/community">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Community
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Feed
          </h1>
          <p className="mt-1 text-muted">
            Wins, questions, and guidance from the ScaleX cohort.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/community?channel=latest"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activeChannel === "latest"
                ? "bg-scalex-red text-white"
                : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            Latest
          </Link>
          {COMMUNITY_CHANNELS.map((channel) => (
            <Link
              key={channel.key}
              href={`/community?channel=${channel.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeChannel === channel.key
                  ? "bg-scalex-red text-white"
                  : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
              }`}
            >
              {channel.label}
            </Link>
          ))}
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Create a post</h2>
          <p className="mt-1 text-sm text-muted">
            Student posts are reviewed before going live.
          </p>
          <form
            action={createPostAction}
            className="mt-4 space-y-3"
            encType="multipart/form-data"
          >
            {activeChannel === "latest" ? (
              <div>
                <label
                  htmlFor="channel"
                  className="mb-1.5 block text-sm font-medium text-muted"
                >
                  Channel
                </label>
                <select
                  id="channel"
                  name="channel"
                  defaultValue={composerChannel}
                  className={inputClasses}
                >
                  {COMMUNITY_CHANNELS.filter((c) => c.key !== "announcements").map(
                    (c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            ) : (
              <input type="hidden" name="channel" value={activeChannel} />
            )}
            <textarea
              name="content"
              rows={3}
              required
              className={inputClasses}
              placeholder="What's on your mind?"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:text-foreground"
            />
            <Button type="submit">Post</Button>
          </form>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="divide-y divide-line px-4 sm:px-5">
            {posts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                No posts yet. Be the first to share!
              </p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  activeChannel={activeChannel}
                />
              ))
            )}
          </div>
        </Card>

        {oldest && posts.length >= 15 && (
          <div className="text-center">
            <Link
              href={`/community?channel=${activeChannel}&before=${encodeURIComponent(oldest)}`}
              className="text-sm font-medium text-scalex-red hover:underline"
            >
              Load more
            </Link>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
