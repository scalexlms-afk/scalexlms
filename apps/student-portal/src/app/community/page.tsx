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

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-scalex-red/20 text-sm font-semibold text-scalex-red">
      {initial}
    </div>
  );
}

function PostCard({
  post,
  activeChannel,
  showFullComments = false,
}: {
  post: CommunityPost;
  activeChannel: string;
  showFullComments?: boolean;
}) {
  const name = post.profiles?.name ?? "Student";
  const comments = post.comments ?? [];
  const previewComments = showFullComments ? comments : comments.slice(-2);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AuthorAvatar name={name} avatarUrl={post.profiles?.avatar_url} />
          <div>
            <p className="font-medium text-foreground">{name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-xs text-subtle">{formatTime(post.created_at)}</p>
              {post.profiles?.plan && (
                <StatusPill
                  label={planLabel(post.profiles.plan, true)}
                  variant={planPillVariant(post.profiles.plan)}
                />
              )}
            </div>
          </div>
        </div>
        {post.status === "pending_approval" && (
          <StatusPill label="Pending approval" variant="pending" />
        )}
      </div>

      <Link href={`/community/${post.id}`} className="mt-3 block">
        <p className="whitespace-pre-wrap text-sm text-foreground hover:opacity-90">
          {post.content}
        </p>
      </Link>

      {(post.media_urls?.length ?? 0) > 0 && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {post.media_urls?.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="max-h-64 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        <form action={toggleLikeAction}>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="channel" value={activeChannel} />
          <button
            type="submit"
            className={`text-sm transition-colors ${
              post.liked_by_user
                ? "text-scalex-red"
                : "text-muted hover:text-scalex-red"
            }`}
          >
            {post.liked_by_user ? "♥ Liked" : "♡ Like"} · {post.like_count}
          </button>
        </form>
        <Link
          href={`/community/${post.id}`}
          className="text-sm text-subtle hover:text-scalex-red"
        >
          {comments.length} comments
        </Link>
      </div>

      {previewComments.length > 0 && (
        <ul className="mt-4 space-y-3 border-t border-line pt-4">
          {previewComments.map((comment) => (
            <li key={comment.id} className="flex gap-2">
              <AuthorAvatar
                name={comment.profiles?.name ?? "Student"}
                avatarUrl={comment.profiles?.avatar_url}
              />
              <div className="min-w-0 flex-1 rounded-lg bg-surface-3 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-foreground">
                    {comment.profiles?.name ?? "Student"}
                  </p>
                  <p className="text-[11px] text-subtle">
                    {formatTime(comment.created_at)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {post.status === "approved" && (
        <form action={addCommentAction} className="mt-4 flex gap-2">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="channel" value={activeChannel} />
          <input
            name="content"
            required
            placeholder="Add a comment…"
            className={inputClasses}
          />
          <Button type="submit" size="sm">
            Reply
          </Button>
        </form>
      )}
    </Card>
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
    COMMUNITY_CHANNELS.find((item) => item.key === params.channel)?.key ??
    "questions";

  const posts = await getCommunityPosts(
    activeChannel as CommunityChannel,
    userId,
    15,
    params.before
  );
  const oldest = posts[posts.length - 1]?.created_at;

  return (
    <PortalShell activePath="/community">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Community
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Community feed
          </h1>
          <p className="mt-1 text-muted">
            Share wins, ask questions, and learn from fellow sellers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
            Posts are reviewed before appearing publicly.
          </p>
          <form
            action={createPostAction}
            className="mt-4 space-y-3"
            encType="multipart/form-data"
          >
            <input type="hidden" name="channel" value={activeChannel} />
            <textarea
              name="content"
              rows={4}
              required
              className={inputClasses}
              placeholder="Share an update or ask a question…"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:text-foreground"
            />
            <Button type="submit">Submit for approval</Button>
          </form>
        </Card>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">
                No posts in this channel yet. Be the first to share!
              </p>
            </Card>
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
