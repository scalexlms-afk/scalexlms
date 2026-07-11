"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { requireStudentProfile } from "@/lib/auth";
import type { CommunityChannel } from "@/lib/data";

export async function createPostAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const channel = formData.get("channel");
  const content = formData.get("content");

  if (typeof channel !== "string" || !channel) {
    throw new Error("Channel is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Post content is required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("community_posts").insert({
    channel: channel as CommunityChannel,
    author_id: userId,
    content: content.trim(),
    status: "pending_approval",
  } as never);

  if (error) throw new Error(error.message);

  revalidatePath("/community");
}

export async function addCommentAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const postId = formData.get("postId");
  const content = formData.get("content");
  const channel = formData.get("channel");

  if (typeof postId !== "string" || !postId) {
    throw new Error("Post id is required");
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Comment is required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    author_id: userId,
    content: content.trim(),
  } as never);

  if (error) throw new Error(error.message);

  revalidatePath("/community");
  if (typeof channel === "string" && channel) {
    revalidatePath(`/community?channel=${channel}`);
  }
}

export async function toggleLikeAction(formData: FormData) {
  const { userId } = await requireStudentProfile();
  const postId = formData.get("postId");

  if (typeof postId !== "string" || !postId) {
    throw new Error("Post id is required");
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
    } as never);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/community");
}
