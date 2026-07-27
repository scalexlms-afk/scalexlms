"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityHero } from "@/components/community/community-hero";
import { ChannelChips } from "@/components/community/channel-chips";
import { CreatePostCard } from "@/components/community/create-post-card";
import { PostFeed } from "@/components/community/post-card";
import { CommunityRail } from "@/components/community/community-rail";
import { AskAiBanner } from "@/components/community/ask-ai-banner";
import type {
  CommunityChannel,
  CommunityPost,
  CommunityRailData,
} from "@/lib/community-shared";

export function CommunityWorkspace({
  posts,
  rail,
  activeChannel,
  loadMoreHref,
}: {
  posts: CommunityPost[];
  rail: CommunityRailData;
  activeChannel: CommunityChannel | "latest";
  loadMoreHref: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q")?.trim() ?? "";
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSearchQuery(initialQ);
  }, [initialQ]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const name = post.profiles?.name?.toLowerCase() ?? "";
      return (
        post.content.toLowerCase().includes(q) ||
        name.includes(q) ||
        post.channel.toLowerCase().includes(q)
      );
    });
  }, [posts, searchQuery]);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `/community?${qs}` : "/community", { scroll: false });
  }

  function focusComposer() {
    const el = document.getElementById("create-post");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    queueMicrotask(() => composerRef.current?.focus());
  }

  return (
    <div className="community-theme space-y-6">
      <CommunityHero
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onCreatePost={focusComposer}
      />

      <ChannelChips activeChannel={activeChannel} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <CreatePostCard
            ref={composerRef}
            activeChannel={activeChannel}
          />

          <PostFeed
            posts={filteredPosts}
            activeChannel={activeChannel}
            emptyMessage={
              searchQuery.trim()
                ? "No posts match your search."
                : "No posts yet. Be the first to share!"
            }
          />

          {loadMoreHref && !searchQuery.trim() ? (
            <div className="text-center">
              <a
                href={loadMoreHref}
                className="text-sm font-medium text-accent-purple hover:underline"
              >
                Load more
              </a>
            </div>
          ) : null}

          <AskAiBanner
            queryHint={
              searchQuery.trim()
                ? searchQuery.trim().slice(0, 200)
                : "Help me with my Amazon FBA question"
            }
          />
        </div>

        <CommunityRail data={rail} />
      </div>
    </div>
  );
}
