"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { normalizePlan, writeAuditLog, createNotification } from "@scalex/db";
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

export async function logMentorCallAction(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const scheduledAt = formData.get("scheduled_at") as string;
  const durationMinutes = Number(formData.get("duration_minutes") || 0) || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "scheduled";

  if (!studentId || !scheduledAt) throw new Error("Student and time required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const db = getServiceDb();
  const { data: student } = await db
    .from("profiles")
    .select("id, plan, mentor_id")
    .eq("id", studentId)
    .single();

  const studentRow = student as {
    plan: string | null;
    mentor_id: string | null;
  } | null;

  if (studentRow?.plan !== "premium") {
    throw new Error("Mentor calls can only be logged for Premium students");
  }

  const mentorId =
    profile.role === "mentor" ? userId : studentRow.mentor_id || userId;

  const { error } = await db.from("mentor_calls").insert({
    student_id: studentId,
    mentor_id: mentorId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    duration_minutes: durationMinutes,
    notes,
    status,
  } as never);

  if (error) throw new Error(error.message);

  await writeAuditLog({
    actorId: userId,
    action: "mentor_call.logged",
    targetType: "mentor_call",
    targetId: studentId,
    metadata: { scheduledAt, status },
  });

  revalidatePath(`/students/${studentId}`);
}

export async function replyToStudentAction(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const content = (formData.get("content") as string)?.trim();
  const redirectTo = (formData.get("redirectTo") as string) || `/students/${studentId}`;

  if (!studentId || !content) throw new Error("Message required");

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "student_management");

  const db = getServiceDb();
  const { data: student } = await db
    .from("profiles")
    .select("id, role, plan, mentor_id, status")
    .eq("id", studentId)
    .maybeSingle();

  const studentRow = student as {
    id: string;
    role: string;
    plan: string | null;
    mentor_id: string | null;
    status: string;
  } | null;

  if (!studentRow || studentRow.role !== "student") {
    throw new Error("Student not found");
  }

  if (profile.role === "mentor" && studentRow.mentor_id !== userId) {
    throw new Error("You can only message your assigned students");
  }

  if (studentRow.plan !== "premium") {
    throw new Error("Direct mentor messaging is for Premium students only");
  }

  const { error } = await db.from("messages").insert({
    sender_id: userId,
    recipient_id: studentId,
    content,
  } as never);

  if (error) throw new Error(error.message);

  await createNotification({
    userId: studentId,
    type: "message",
    title: "New message from your mentor",
    body: content.slice(0, 120),
    payload: { from: userId },
  });

  await writeAuditLog({
    actorId: userId,
    action: "message.sent",
    targetType: "profile",
    targetId: studentId,
  });

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/messages");
  revalidatePath(`/messages/${studentId}`);

  if (redirectTo.startsWith("/messages")) {
    redirect(`/messages/${studentId}?sent=1`);
  }
}
