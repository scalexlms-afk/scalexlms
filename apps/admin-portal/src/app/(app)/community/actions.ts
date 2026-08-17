"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { createNotification, writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";

export async function moderatePostAction(formData: FormData) {
  const postId = formData.get("postId") as string;
  const decision = formData.get("decision") as "approved" | "rejected";

  if (!postId || !["approved", "rejected"].includes(decision)) {
    throw new Error("Invalid moderation request");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "community");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phase2 = supabase as any;

  const { data: post, error: fetchError } = await phase2
    .from("community_posts")
    .select("id, author_id, content")
    .eq("id", postId)
    .single();

  if (fetchError || !post) {
    throw new Error("Post not found");
  }

  const { error: updateError } = await phase2
    .from("community_posts")
    .update({ status: decision })
    .eq("id", postId);

  if (updateError) throw new Error(updateError.message);

  await writeAuditLog({
    actorId: userId,
    action: `community_post.${decision}`,
    targetType: "community_post",
    targetId: postId,
    metadata: {
      decision,
      authorId: (post as { author_id: string }).author_id,
    },
  });

  await createNotification({
    userId: (post as { author_id: string }).author_id,
    type: "community_moderation",
    title:
      decision === "approved"
        ? "Your community post was approved"
        : "Your community post was rejected",
    body:
      decision === "approved"
        ? "Your post is now live in the community feed."
        : "Your post did not pass moderation. You can revise and post again.",
    payload: { postId, decision },
  });

  revalidatePath("/community");
}

export async function createStaffPostAction(formData: FormData) {
  const channel = formData.get("channel") as string;
  const content = (formData.get("content") as string)?.trim();
  const image = formData.get("image");

  if (!channel || !content) throw new Error("Channel and content required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "community");

  const supabase = await createClient();
  const mediaUrls: string[] = [];

  if (image instanceof File && image.size > 0) {
    const ext = image.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `staff/${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("community-media")
      .upload(path, image, {
        contentType: image.type || "image/jpeg",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);
    const { data: publicUrl } = supabase.storage
      .from("community-media")
      .getPublicUrl(path);
    if (publicUrl?.publicUrl) mediaUrls.push(publicUrl.publicUrl);
  }

  // Staff/mentor posts are auto-approved (RLS + guard allow staff).
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      channel,
      author_id: userId,
      content,
      status: "approved",
      media_urls: mediaUrls,
    } as never)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  const postId = (data as { id: string } | null)?.id;
  if (!postId) throw new Error("Failed to create post");

  await writeAuditLog({
    actorId: userId,
    action: "community_post.staff_created",
    targetType: "community_post",
    targetId: postId,
    metadata: { channel, autoApproved: true },
  });

  revalidatePath("/community");
}
