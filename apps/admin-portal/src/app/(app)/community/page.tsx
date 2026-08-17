import {
  AdminDetailRail,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getCommunityModerationStats,
  getCommunityPostsByStatus,
  getCommunityTopContributors,
  type CommunityModerationStatus,
} from "@/lib/data";
import { inputClasses } from "@/components/field";
import { createStaffPostAction, moderatePostAction } from "./actions";
import { Button, StatusPill } from "@scalex/ui";

function channelLabel(channel: string): string {
  return channel.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const TABS: {
  key: CommunityModerationStatus | "pending";
  label: string;
  status: CommunityModerationStatus;
}[] = [
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

  const [posts, stats, topContributors, announcements] = await Promise.all([
    getCommunityPostsByStatus(status),
    getCommunityModerationStats(),
    getCommunityTopContributors(5),
    getCommunityPostsByStatus("approved", 8).then((rows) =>
      rows.filter((p) => p.channel === "announcements").slice(0, 4)
    ),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Community"
        description="Moderate the student feed, approve posts, and publish staff guidance."
        searchPlaceholder="Search posts..."
        primaryAction={{ label: "+ Staff Post" }}
      />

      <AdminKpiGrid
        items={[
          {
            label: "Pending Review",
            value: String(stats.pendingCount),
            tone: stats.pendingCount > 0 ? "danger" : "default",
            hint: "Awaiting moderation",
          },
          {
            label: "Approved This Week",
            value: String(stats.postsThisWeek),
            tone: "success",
            hint: "Live in the feed",
          },
          {
            label: "In This Tab",
            value: String(posts.length),
            hint: channelLabel(activeTab),
          },
        ]}
      />

      <AdminFilterTabs
        active={activeTab}
        tabs={TABS.map((tab) => ({
          id: tab.key,
          label: tab.label,
          href: `/community?tab=${tab.key}`,
          count: tab.key === "pending" ? stats.pendingCount : undefined,
        }))}
      />

      <AdminSplit
        main={
          <div className="space-y-4">
            <AdminPanel title="Staff post">
              <p className="mb-4 text-sm text-muted">
                Mentor and instructor posts go live immediately with a Staff
                badge.
              </p>
              <form
                action={createStaffPostAction}
                className="space-y-3"
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
            </AdminPanel>

            {posts.length === 0 ? (
              <AdminPanel>
                <p className="text-sm text-muted">No posts in this tab.</p>
              </AdminPanel>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <AdminPanel key={post.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {post.author?.name ?? "Unknown author"}
                        </p>
                        <p className="text-xs text-subtle">
                          {post.author?.email}
                        </p>
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
                          <input
                            type="hidden"
                            name="decision"
                            value="approved"
                          />
                          <Button type="submit" size="sm">
                            Approve
                          </Button>
                        </form>
                        <form action={moderatePostAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <input
                            type="hidden"
                            name="decision"
                            value="rejected"
                          />
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
                          <input
                            type="hidden"
                            name="decision"
                            value="approved"
                          />
                          <Button type="submit" size="sm" variant="secondary">
                            Approve anyway
                          </Button>
                        </form>
                      </div>
                    )}
                  </AdminPanel>
                ))}
              </div>
            )}
          </div>
        }
        rail={
          <div className="space-y-4">
            <AdminDetailRail title="Announcements">
              {announcements.length === 0 ? (
                <p className="text-sm text-muted">No recent announcements.</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((post) => (
                    <li key={post.id} className="text-sm">
                      <p className="font-medium">
                        {post.author?.name ?? "Staff"}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs text-muted">
                        {post.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminDetailRail>
            <AdminDetailRail title="Top contributors">
              {topContributors.length === 0 ? (
                <p className="text-sm text-muted">No approved posts yet.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {topContributors.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="text-xs text-accent-green">
                        {c.posts} pts
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </AdminDetailRail>
          </div>
        }
      />
    </>
  );
}
