import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import {
  COMMUNITY_CHANNELS,
  getCommunityPosts,
  type CommunityChannel,
} from "@/lib/data";
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

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  const { userId } = await requireStudentProfile();
  const params = await searchParams;
  const activeChannel =
    COMMUNITY_CHANNELS.find((item) => item.key === params.channel)?.key ??
    "questions";

  const posts = await getCommunityPosts(activeChannel as CommunityChannel, userId);

  return (
    <PortalShell activePath="/community">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Community
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Connect with fellow sellers
          </h1>
          <p className="mt-1 text-muted">
            Share wins, ask questions, and learn from the LaunchPad community.
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
            Posts are reviewed before appearing in the feed.
          </p>
          <form action={createPostAction} className="mt-4 space-y-3">
            <input type="hidden" name="channel" value={activeChannel} />
            <textarea
              name="content"
              rows={4}
              required
              className={inputClasses}
              placeholder="Share an update or ask a question…"
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
              <Card key={post.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {post.profiles?.name ?? "Student"}
                    </p>
                    <p className="text-xs text-subtle">
                      {formatTime(post.created_at)}
                    </p>
                  </div>
                  {post.status === "pending_approval" && (
                    <StatusPill label="Pending approval" variant="pending" />
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                  {post.content}
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <form action={toggleLikeAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <button
                      type="submit"
                      className={`text-sm transition-colors ${
                        post.liked_by_user
                          ? "text-scalex-red"
                          : "text-muted hover:text-scalex-red"
                      }`}
                    >
                      {post.liked_by_user ? "♥" : "♡"} {post.like_count}
                    </button>
                  </form>
                  <span className="text-sm text-subtle">
                    {post.comments?.length ?? 0} comments
                  </span>
                </div>

                {(post.comments?.length ?? 0) > 0 && (
                  <ul className="mt-4 space-y-3 border-t border-line pt-4">
                    {post.comments?.map((comment) => (
                      <li
                        key={comment.id}
                        className="rounded-lg bg-surface-3 px-3 py-2"
                      >
                        <p className="text-xs font-medium text-foreground">
                          {comment.profiles?.name ?? "Student"}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {comment.content}
                        </p>
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
            ))
          )}
        </div>
      </div>
    </PortalShell>
  );
}
