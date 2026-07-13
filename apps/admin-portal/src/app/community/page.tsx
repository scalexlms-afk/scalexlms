import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getCommunityModerationStats,
  getCommunityPostsByStatus,
  type CommunityModerationStatus,
} from "@/lib/data";
import { inputClasses } from "@/components/field";
import { createStaffPostAction, moderatePostAction } from "./actions";
import { Button, Card, KpiCard, StatusPill } from "@scalex/ui";

function channelLabel(channel: string): string {
  return channel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TABS: { key: CommunityModerationStatus | "pending"; label: string; status: CommunityModerationStatus }[] = [
  { key: "pending", label: "Pending", status: "pending_approval" },
  { key: "approved", label: "Approved", status: "approved" },
  { key: "rejected", label: "Rejected", status: "rejected" },
];

export default async function CommunityModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { profile } = await requireAdminProfile();
  requireFeaturePage(profile.role, "community");

  const params = await searchParams;
  const activeTab =
    TABS.find((t) => t.key === params.tab)?.key ?? "pending";
  const status =
    TABS.find((t) => t.key === activeTab)?.status ?? "pending_approval";

  const [posts, stats] = await Promise.all([
    getCommunityPostsByStatus(status),
    getCommunityModerationStats(),
  ]);

  return (
    <AdminShell activePath="/community">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Community
          </h1>
          <p className="mt-1 text-muted">
            Moderate the feed and publish staff guidance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard label="Pending review" value={String(stats.pendingCount)} />
          <KpiCard
            label="Approved this week"
            value={String(stats.postsThisWeek)}
          />
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Staff post</h2>
          <p className="mt-1 text-sm text-muted">
            Mentor and instructor posts go live immediately with a Staff badge.
          </p>
          <form
            action={createStaffPostAction}
            className="mt-4 space-y-3"
            encType="multipart/form-data"
          >
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
                defaultValue="announcements"
                className={inputClasses}
              >
                <option value="announcements">Announcements</option>
                <option value="product_hunting">Product Hunting</option>
                <option value="supplier_help">Supplier Help</option>
                <option value="ppc_discussion">PPC Discussion</option>
                <option value="questions">Questions</option>
                <option value="student_wins">Student Wins</option>
              </select>
            </div>
            <textarea
              name="content"
              rows={3}
              required
              className={inputClasses}
              placeholder="Share guidance with students…"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:text-foreground"
            />
            <Button type="submit">Publish</Button>
          </form>
        </Card>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/community?tab=${tab.key}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-scalex-red text-white"
                  : "bg-surface-2 text-muted hover:bg-surface-3"
              }`}
            >
              {tab.label}
              {tab.key === "pending" ? ` (${stats.pendingCount})` : ""}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No posts in this tab.</p>
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
                    <p className="text-xs text-subtle">{post.author?.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill
                      label={channelLabel(post.channel)}
                      variant="neutral"
                    />
                    <StatusPill
                      label={
                        post.status === "pending_approval"
                          ? "Pending"
                          : post.status
                      }
                      variant={
                        post.status === "approved"
                          ? "approved"
                          : post.status === "rejected"
                            ? "revision"
                            : "pending"
                      }
                    />
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm text-muted">
                  {post.content}
                </p>

                {(post.media_urls?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.media_urls?.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt=""
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-subtle">
                  {new Date(post.created_at).toLocaleString()}
                </p>

                {post.status === "pending_approval" && (
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
                )}
                {post.status === "rejected" && (
                  <div className="mt-4">
                    <form action={moderatePostAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="decision" value="approved" />
                      <Button type="submit" size="sm" variant="secondary">
                        Approve anyway
                      </Button>
                    </form>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
