"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { canAssignMentor, getServiceDb } from "@/lib/admin-db";

export async function assignMentorAction(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const mentorId = (formData.get("mentorId") as string) || null;

  if (!studentId) throw new Error("Student required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");
  if (!canAssignMentor(profile.role)) {
    throw new Error("Forbidden");
  }

  const db = getServiceDb();
  const { error } = await db
    .from("profiles")
    .update({ mentor_id: mentorId || null })
    .eq("id", studentId)
    .eq("role", "student");

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "student.mentor_assigned",
    targetType: "profile",
    targetId: studentId,
    metadata: { mentorId },
  });

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
}
