"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@scalex/db/server";
import {
  assertSubmissionTransition,
  createNotification,
  type SubmissionStatus,
} from "@scalex/db";
import { scoreSubmission } from "@scalex/ai";
import { requireStudentProfile } from "@/lib/auth";
import {
  getTaskByMilestoneId,
  getSubmissionForTask,
  isMilestoneUnlocked,
} from "@/lib/data";

function buildSubmissionText(content: Record<string, unknown>): string {
  if (typeof content.text === "string") return content.text;
  if (typeof content.link === "string") return content.link;
  if (typeof content.file_name === "string") {
    return `File submission: ${content.file_name}`;
  }
  return JSON.stringify(content);
}

export async function submitTaskAction(formData: FormData) {
  const { userId, profile } = await requireStudentProfile();
  const milestoneId = formData.get("milestoneId");
  const submissionType = formData.get("submissionType");

  if (typeof milestoneId !== "string" || !milestoneId) {
    throw new Error("Milestone id is required");
  }
  if (typeof submissionType !== "string" || !submissionType) {
    throw new Error("Submission type is required");
  }

  const unlocked = await isMilestoneUnlocked(userId, milestoneId);
  if (!unlocked) {
    throw new Error("This milestone task is locked");
  }

  const task = await getTaskByMilestoneId(milestoneId);
  if (!task) {
    throw new Error("Task not found for this milestone");
  }

  const supabase = await createClient();
  let submission = await getSubmissionForTask(task.id, userId);
  const currentStatus = (submission?.status ?? "not_started") as SubmissionStatus;

  if (
    currentStatus !== "not_started" &&
    currentStatus !== "revision_required"
  ) {
    throw new Error("Submission cannot be updated in its current status");
  }

  const commentsRaw = formData.get("comments");
  const comments =
    typeof commentsRaw === "string" && commentsRaw.trim()
      ? commentsRaw.trim()
      : null;

  let content: Record<string, unknown> = { type: submissionType };

  if (submissionType === "text") {
    const text = formData.get("text");
    if (typeof text !== "string" || !text.trim()) {
      throw new Error("Text submission is required");
    }
    content = { type: "text", text: text.trim() };
  } else if (submissionType === "link") {
    const link = formData.get("link");
    if (typeof link !== "string" || !link.trim()) {
      throw new Error("Link is required");
    }
    content = { type: "link", link: link.trim() };
  } else if (submissionType === "file") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("File is required");
    }
    const path = `${userId}/${task.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("submissions")
      .upload(path, await file.arrayBuffer(), { contentType: file.type });
    if (uploadError) throw new Error(uploadError.message);
    content = { type: "file", file_path: path, file_name: file.name };
  } else {
    throw new Error("Invalid submission type");
  }

  if (comments) {
    content = { ...content, comments };
  }

  const submittedAt = new Date().toISOString();

  if (submission) {
    assertSubmissionTransition(currentStatus, "submitted");
    const { error } = await supabase
      .from("submissions")
      .update({
        content,
        status: "submitted",
        submitted_at: submittedAt,
        ai_score: null,
        ai_notes: null,
      } as never)
      .eq("id", submission.id);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("submissions").insert({
      task_id: task.id,
      student_id: userId,
      content,
      status: "submitted",
      submitted_at: submittedAt,
    } as never);

    if (error) throw new Error(error.message);
  }

  submission = await getSubmissionForTask(task.id, userId);
  if (!submission) {
    throw new Error("Failed to save submission");
  }

  const scoringText = buildSubmissionText(content);

  // AI pre-scoring is best-effort. If it fails, we still advance the submission
  // to "under_review" so it never gets stuck in "submitted" — a mentor can
  // review it manually without the AI note.
  let aiScore: number | null = null;
  let aiNotes: string | null = null;
  try {
    const aiResult = await scoreSubmission(
      task.title,
      task.description ?? "",
      scoringText
    );
    aiScore = aiResult.score;
    aiNotes = aiResult.notes;
  } catch (err) {
    console.error("AI scoring failed; advancing submission without a score", err);
    aiNotes = "AI pre-scoring was unavailable. Awaiting manual mentor review.";
  }

  const serviceClient = createServiceClient();
  const { error: reviewError } = await serviceClient
    .from("submissions")
    .update({
      status: "under_review",
      ai_score: aiScore,
      ai_notes: aiNotes,
    } as never)
    .eq("id", submission.id);

  if (reviewError) throw new Error(reviewError.message);

  if (profile.mentor_id) {
    await createNotification({
      userId: profile.mentor_id,
      type: "submission_review",
      title: "New submission to review",
      body: `${profile.name} submitted "${task.title}" for mentor review.`,
      payload: {
        submission_id: submission.id,
        student_id: userId,
        task_id: task.id,
      },
    });
  }

  revalidatePath(`/tasks/${milestoneId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  revalidatePath("/continue-learning");
}
