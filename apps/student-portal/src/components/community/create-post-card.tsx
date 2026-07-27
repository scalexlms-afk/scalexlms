"use client";

import { forwardRef } from "react";
import { Image as ImageIcon, PaperPlaneTilt } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import { COMMUNITY_CHANNELS, type CommunityChannel } from "@/lib/data";
import { createPostAction } from "@/app/(portal)/community/actions";

const composerInput =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export const CreatePostCard = forwardRef<
  HTMLTextAreaElement,
  {
    activeChannel: CommunityChannel | "latest";
  }
>(function CreatePostCard({ activeChannel }, ref) {
  const composerChannel =
    activeChannel === "latest" ? "questions" : activeChannel;
  const showChannelSelect = activeChannel === "latest";

  return (
    <Card
      id="create-post"
      className="border-dashed border-accent-purple/30 bg-surface-2/40"
    >
      <h2 className="font-display text-lg font-semibold">Create a Post</h2>
      <p className="mt-1 text-sm text-muted">
        Student posts are reviewed before going live.
      </p>
      <form
        action={createPostAction}
        className="mt-4 space-y-3"
        encType="multipart/form-data"
      >
        {showChannelSelect ? (
          <div>
            <label
              htmlFor="community-channel"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Category
            </label>
            <select
              id="community-channel"
              name="channel"
              defaultValue={composerChannel}
              className={composerInput}
            >
              {COMMUNITY_CHANNELS.filter((c) => c.key !== "announcements").map(
                (c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                )
              )}
            </select>
          </div>
        ) : (
          <input type="hidden" name="channel" value={activeChannel} />
        )}

        <textarea
          ref={ref}
          name="content"
          rows={3}
          required
          className={composerInput}
          placeholder="Share a win, ask a question, or start a discussion…"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-3/50 px-3 py-2 text-sm text-muted transition hover:border-accent-purple/40 hover:text-foreground">
            <ImageIcon weight="duotone" className="h-4 w-4" aria-hidden />
            Add image
            <input
              type="file"
              name="image"
              accept="image/*"
              className="sr-only"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-purple/90"
          >
            <PaperPlaneTilt weight="fill" className="h-4 w-4" aria-hidden />
            Post
          </button>
        </div>
      </form>
    </Card>
  );
});
