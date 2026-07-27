import { Suspense } from "react";
import { requireStudentProfile } from "@/lib/auth";
import {
  COMMUNITY_CHANNELS,
  getCommunityPosts,
  type CommunityChannel,
} from "@/lib/data";
import { getCommunityRailData } from "@/lib/community";
import { CommunityWorkspace } from "@/components/community/community-workspace";

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string; before?: string; q?: string }>;
}) {
  const { userId } = await requireStudentProfile();
  const params = await searchParams;
  const activeChannel =
    params.channel === "latest" || !params.channel
      ? "latest"
      : (COMMUNITY_CHANNELS.find((item) => item.key === params.channel)?.key ??
        "latest");

  const [posts, rail] = await Promise.all([
    getCommunityPosts(
      activeChannel as CommunityChannel | "latest",
      userId,
      15,
      params.before
    ),
    getCommunityRailData(userId),
  ]);

  const oldest = posts[posts.length - 1]?.created_at;
  const loadMoreHref =
    oldest && posts.length >= 15
      ? `/community?channel=${activeChannel}&before=${encodeURIComponent(oldest)}`
      : null;

  return (
    <div className="academy-page">
      <Suspense fallback={null}>
        <CommunityWorkspace
          posts={posts}
          rail={rail}
          activeChannel={activeChannel}
          loadMoreHref={loadMoreHref}
        />
      </Suspense>
    </div>
  );
}
