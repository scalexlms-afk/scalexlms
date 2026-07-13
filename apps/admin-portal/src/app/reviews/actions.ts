"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@scalex/db/server";
import {
  assertSubmissionTransition,
  badgeKeyForMilestone,
  BADGE_LABELS,
  createNotification,
  writeAuditLog,
  type SubmissionStatus,
} from "@scalex/db";
import { requireAdminProfile, requireFeature } from "@/lib/auth";

type SubmissionRow = {
  id: string;
  student_id: string;
  status: SubmissionStatus;
  task: {
    milestone: { order_index: number } | null;
  } | null;
};

export async function reviewSubmissionAction(formData: FormData) {
  const submissionId = formData.get("submissionId") as string;
  const decision = formData.get("decision") as "approved" | "revision_required";
  const feedback = (formData.get("feedback") as string)?.trim() || null;

  if (!submissionId || !["approved", "revision_required"].includes(decision)) {
    throw new Error("Invalid review request");
  }

  const { userId, profile } = await requireAdminProfile();
  requireFeature(profile.role, "task_review");

  // Per ROLES.md: instructors may review/comment (request revisions) but final
  // approval on a gating task belongs to a Mentor or Super Admin.
  if (decision === "approved" && profile.role === "instructor") {
    throw new Error(
      "Instructors cannot issue final approval. A mentor or super admin must approve."
    );
  }

  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const phase2 = supabase as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const servicePhase2 = serviceClient as any;

  const { data: submission, error: fetchError } = await phase2
    .from("submissions")
    .select(
      "id, student_id, status, task:tasks(milestone:milestones(order_index))"
    )
    .eq("id", submissionId)
    .single();

  if (fetchError || !submission) {
    throw new Error("Submission not found");
  }

  const row = submission as SubmissionRow;

  if (profile.role === "mentor") {
    const { data: student } = await supabase
      .from("profiles")
      .select("mentor_id")
      .eq("id", row.student_id)
      .single();

    if ((student as { mentor_id: string | null } | null)?.mentor_id !== userId) {
      throw new Error("Forbidden");
    }
  }

  const newStatus: SubmissionStatus =
    decision === "approved" ? "approved" : "revision_required";

  assertSubmissionTransition(row.status, newStatus);

  const { error: reviewError } = await phase2
    .from("reviews")
    .insert({
      submission_id: submissionId,
      reviewer_id: userId,
      decision,
      feedback,
    });

  if (reviewError) throw new Error(reviewError.message);

  const { error: updateError } = await phase2
    .from("submissions")
    .update({ status: newStatus })
    .eq("id", submissionId);

  if (updateError) throw new Error(updateError.message);

  await writeAuditLog({
    actorId: userId,
    action:
      decision === "approved"
        ? "submission.approved"
        : "submission.revision_required",
    targetType: "submission",
    targetId: submissionId,
    metadata: { decision, feedback },
  });

  await createNotification({
    userId: row.student_id,
    type: "submission_review",
    title:
      decision === "approved" ? "Task approved" : "Revision requested",
    body:
      feedback ??
      (decision === "approved"
        ? "Your submission has been approved."
        : "Please revise and resubmit your task."),
    payload: { submissionId, decision },
  });

  const { data: studentProfile } = await serviceClient
    .from("profiles")
    .select("name, email")
    .eq("id", row.student_id)
    .maybeSingle();
  const student = studentProfile as { name?: string; email?: string } | null;
  if (student?.email) {
    const { sendTaskReviewedEmail } = await import("@scalex/email");
    const studentPortal =
      process.env.NEXT_PUBLIC_STUDENT_PORTAL_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";
    await sendTaskReviewedEmail({
      to: student.email,
      name: student.name || "there",
      decision,
      feedback,
      taskUrl: `${studentPortal}/roadmap`,
    });
  }

  if (decision === "approved") {
    const orderIndex = row.task?.milestone?.order_index;
    const badgeKey = orderIndex ? badgeKeyForMilestone(orderIndex) : null;

    await createNotification({
      userId: row.student_id,
      type: "milestone_unlocked",
      title: "Progress unlocked",
      body: "Your milestone task was approved — continue to the next stage on your roadmap.",
      payload: { submissionId, orderIndex },
    });

    if (badgeKey) {
      const { error: badgeError } = await servicePhase2
        .from("badges")
        .insert({
          key: badgeKey,
          student_id: row.student_id,
        });

      if (!badgeError) {
        await createNotification({
          userId: row.student_id,
          type: "badge_earned",
          title: "New badge earned",
          body: BADGE_LABELS[badgeKey] ?? badgeKey,
          payload: { badgeKey },
        });
      }
    }
  }

  revalidatePath("/reviews");
}
