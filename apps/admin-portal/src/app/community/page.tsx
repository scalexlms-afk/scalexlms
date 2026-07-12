import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getPendingCommunityPosts } from "@/lib/data";
import { moderatePostAction } from "./actions";
import { Button, Card, StatusPill } from "@scalex/ui";

function channelLabel(channel: string): string {
  return channel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function CommunityModerationPage() {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "community");

  const posts = await getPendingCommunityPosts();

  return (
    <AdminShell activePath="/community">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Community Moderation
          </h1>
          <p className="mt-1 text-muted">
            Approve or reject student posts awaiting moderation.
          </p>
        </div>

        {posts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              The moderation queue is empty.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {post.author?.name ?? "Unknown author"}
                    </p>
                    <p className="text-xs text-subtle">
                      {post.author?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill label={channelLabel(post.channel)} variant="neutral" />
                    <StatusPill label="Pending" variant="pending" />
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-muted">
                  {post.content}
                </p>

                <p className="mt-2 text-xs text-subtle">
                  Submitted {new Date(post.created_at).toLocaleString()}
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={moderatePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <Button type="submit" size="sm">
                      Approve
                    </Button>
                  </form>
                  <form action={moderatePostAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <Button type="submit" variant="destructive" size="sm">
                      Reject
                    </Button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
