"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "@phosphor-icons/react";
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
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q")?.trim() ?? "";
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [composerOpen, setComposerOpen] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (composerOpen && !dialog.open) dialog.showModal();
    if (!composerOpen && dialog.open) dialog.close();
    if (composerOpen) queueMicrotask(() => composerRef.current?.focus());
  }, [composerOpen]);

  function focusComposer() {
    setComposerOpen(true);
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
          <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            className="fixed top-1/2 left-1/2 m-0 w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50"
            onClose={() => setComposerOpen(false)}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <h2 id={titleId} className="font-display text-lg font-semibold">
                Create a post
              </h2>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground"
                aria-label="Close create post"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="p-4">
              <CreatePostCard
                ref={composerRef}
                activeChannel={activeChannel}
              />
            </div>
          </dialog>

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
            sticky
            queryHint={
              searchQuery.trim()
                ? searchQuery.trim().slice(0, 200)
                : "Help me with my Amazon FBA question"
            }
            onSearchSimilar={() => {
              const el = document.querySelector<HTMLInputElement>(
                'input[type="search"], input[placeholder*="Search"]'
              );
              el?.focus();
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </div>

        <CommunityRail data={rail} />
      </div>
    </div>
  );
}
