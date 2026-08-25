"use server";

import { revalidatePath } from "next/cache";
import { getServiceDb } from "@/lib/admin-db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { replyToStudentAction } from "@/app/(app)/students/actions";

export async function markStudentThreadReadAction(studentId: string) {
  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const db = getServiceDb();
  await db
    .from("messages")
    .update({ read_at: new Date().toISOString() } as never)
    .eq("recipient_id", userId)
    .eq("sender_id", studentId)
    .is("read_at", null);

  revalidatePath("/messages");
  revalidatePath(`/messages/${studentId}`);
}

export async function sendStudentChatAction(
  studentId: string,
  content: string
) {
  const fd = new FormData();
  fd.set("studentId", studentId);
  fd.set("content", content);
  fd.set("redirectTo", "");
  await replyToStudentAction(fd);
}
