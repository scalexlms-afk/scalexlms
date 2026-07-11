"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@scalex/db/server";
import { writeAuditLog } from "@scalex/db";
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

  revalidatePath("/community");
}
