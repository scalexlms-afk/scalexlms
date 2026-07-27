import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatCircle, Heart } from "@phosphor-icons/react/dist/ssr";
import { requireStudentProfile } from "@/lib/auth";
import { getCommunityPost } from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import { Card, Button, StatusPill } from "@scalex/ui";
import { addCommentAction, toggleLikeAction } from "../actions";

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const commentInput =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await requireStudentProfile();
  const post = await getCommunityPost(id, userId);
  if (!post) notFound();

  const name = post.profiles?.name ?? "Member";
  const staff =
    post.profiles?.role === "mentor" ||
    post.profiles?.role === "instructor" ||
    post.profiles?.role === "super_admin";

  return (
    <div className="academy-page community-theme">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href={`/community?channel=${post.channel}`}
          className="text-xs text-muted transition hover:text-accent-purple"
        >
          ← Back to feed
        </Link>

        <Card className="border-accent-purple/15">
          <div className="flex items-start gap-3">
            {post.profiles?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.profiles.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-1 ring-line"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple/20 text-base font-semibold text-accent-purple ring-1 ring-line">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">{name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <p className="text-xs text-subtle">
                  {formatTime(post.created_at)}
                </p>
                {staff ? (
                  <StatusPill
                    label={
                      post.profiles?.role === "mentor" ? "Mentor" : "Staff"
                    }
                    variant="active"
                  />
                ) : (
                  post.profiles?.plan && (
                    <StatusPill
                      label={planLabel(post.profiles.plan, true)}
                      variant={planPillVariant(post.profiles.plan)}
                    />
                  )
                )}
                {post.status === "pending_approval" && (
                  <StatusPill label="Pending approval" variant="pending" />
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {post.content}
          </p>

          {(post.media_urls?.length ?? 0) > 0 && (
            <div className="mt-4 grid gap-3">
              {post.media_urls?.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          <form action={toggleLikeAction} className="mt-4">
            <input type="hidden" name="postId" value={post.id} />
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
              {post.liked_by_user ? "Liked" : "Like"} · {post.like_count}
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <ChatCircle
              weight="duotone"
              className="h-5 w-5 text-accent-purple"
              aria-hidden
            />
            Comments ({post.comments?.length ?? 0})
          </h2>
          <ul className="mt-4 space-y-3">
            {(post.comments ?? []).length === 0 ? (
              <li className="text-sm text-muted">No comments yet.</li>
            ) : (
              (post.comments ?? []).map((comment) => (
                <li key={comment.id} className="rounded-xl bg-surface-3/70 p-3">
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
                className={commentInput}
              />
              <Button
                type="submit"
                size="sm"
                className="!bg-accent-purple hover:!bg-accent-purple/90"
              >
                Reply
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
