import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import { getCommunityPost } from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import { Card, Button, StatusPill } from "@scalex/ui";
import { inputClasses } from "@/components/field";
import { addCommentAction, toggleLikeAction } from "../actions";

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await requireStudentProfile();
  const post = await getCommunityPost(id, userId);
  if (!post) notFound();

  const name = post.profiles?.name ?? "Student";

  return (
    <PortalShell activePath="/community">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`/community?channel=${post.channel}`}
          className="text-xs text-muted hover:text-scalex-red"
        >
          ← Back to feed
        </Link>

        <Card>
          <div className="flex items-start gap-3">
            {post.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-scalex-red/20 text-base font-semibold text-scalex-red">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <p className="text-xs text-subtle">
                  {formatTime(post.created_at)}
                </p>
                {post.profiles?.plan && (
                  <StatusPill
                    label={planLabel(post.profiles.plan, true)}
                    variant={planPillVariant(post.profiles.plan)}
                  />
                )}
                {post.status === "pending_approval" && (
                  <StatusPill label="Pending approval" variant="pending" />
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm">{post.content}</p>

          {(post.media_urls?.length ?? 0) > 0 && (
            <div className="mt-4 grid gap-3">
              {post.media_urls?.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <form action={toggleLikeAction} className="mt-4">
            <input type="hidden" name="postId" value={post.id} />
            <button
              type="submit"
              className={`text-sm ${
                post.liked_by_user ? "text-scalex-red" : "text-muted"
              }`}
            >
              {post.liked_by_user ? "♥ Liked" : "♡ Like"} · {post.like_count}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">
            Comments ({post.comments?.length ?? 0})
          </h2>
          <ul className="mt-4 space-y-3">
            {(post.comments ?? []).length === 0 ? (
              <li className="text-sm text-muted">No comments yet.</li>
            ) : (
              (post.comments ?? []).map((comment) => (
                <li key={comment.id} className="rounded-lg bg-surface-3 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium">
                      {comment.profiles?.name ?? "Student"}
                    </p>
                    <p className="text-[11px] text-subtle">
                      {formatTime(comment.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted">{comment.content}</p>
                </li>
              ))
            )}
          </ul>

          {post.status === "approved" && (
            <form action={addCommentAction} className="mt-4 flex gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="channel" value={post.channel} />
              <input
                name="content"
                required
                placeholder="Write a comment…"
                className={inputClasses}
              />
              <Button type="submit" size="sm">
                Reply
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}
