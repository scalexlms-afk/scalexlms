"use server";

import { revalidatePath } from "next/cache";
import { normalizePlan, writeAuditLog } from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { canAssignMentor, canManageFinance, getServiceDb } from "@/lib/admin-db";

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

export async function updateStudentPlanAction(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const plan = normalizePlan(formData.get("plan") as string);

  if (!studentId) throw new Error("Student required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management", "full");
  if (!canManageFinance(profile.role)) {
    throw new Error("Forbidden");
  }

  const db = getServiceDb();
  const { error: profileError } = await db
    .from("profiles")
    .update({ plan } as never)
    .eq("id", studentId)
    .eq("role", "student");

  if (profileError) throw new Error(profileError.message);

  await db
    .from("enrollments")
    .update({ plan } as never)
    .eq("student_id", studentId);

  await writeAuditLog({
    actorId: userId,
    action: "student.plan_updated",
    targetType: "profile",
    targetId: studentId,
    metadata: { plan },
  });

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/");
}
