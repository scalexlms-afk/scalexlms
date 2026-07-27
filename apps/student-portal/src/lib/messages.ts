import { createClient } from "@scalex/db/server";
import type { Profile } from "@scalex/db/types";
import { getAiMentorContext } from "@/lib/ai-mentor";
import type {
  ChatMessageRow,
  MessagesPageData,
  RecentSubmissionItem,
  SubmissionStatusKey,
} from "@/lib/messages-shared";
import {
  truncatePreview,
} from "@/lib/messages-shared";

export type {
  ChatMessageRow,
  MentorSummary,
  MessagesLearningContext,
  MessagesPageData,
  RecentSubmissionItem,
  SubmissionStatusKey,
} from "@/lib/messages-shared";
export {
  formatMessageClock,
  formatThreadTime,
  mentorInitials,
  submissionStatusLabel,
  submissionStatusVariant,
  truncatePreview,
  SUBMISSION_STATUS_LABELS,
} from "@/lib/messages-shared";

type MessageQueryRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at: string | null;
  sender: { name: string } | null;
};

type SubmissionQueryRow = {
  id: string;
  status: SubmissionStatusKey;
  submitted_at: string | null;
  updated_at: string;
  task_id: string;
  task: { id: string; title: string } | null;
};

export async function getMessagesPageData(
  userId: string,
  profile: Profile
): Promise<MessagesPageData | null> {
  if (!profile.mentor_id) return null;

  const mentorId = profile.mentor_id;
  const supabase = await createClient();

  const [
    { data: messages },
    { data: mentor },
    { count: unreadCount },
    context,
    { data: submissionRows },
  ] = await Promise.all([
    supabase
      .from("messages")
      .select(
        "id, content, created_at, sender_id, recipient_id, read_at, sender:profiles!sender_id(name)"
      )
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${mentorId}),and(sender_id.eq.${mentorId},recipient_id.eq.${userId})`
      )
      .order("created_at", { ascending: true })
      .limit(100),
    supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("id", mentorId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("sender_id", mentorId)
      .is("read_at", null),
    getAiMentorContext(userId),
    supabase
      .from("submissions")
      .select(
        "id, status, submitted_at, updated_at, task_id, task:tasks!task_id(id, title)"
      )
      .eq("student_id", userId)
      .neq("status", "not_started")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const thread = ((messages ?? []) as MessageQueryRow[]).map(
    (row): ChatMessageRow => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      sender_id: row.sender_id,
      recipient_id: row.recipient_id,
      read_at: row.read_at,
      sender: row.sender,
    })
  );

  const last = thread[thread.length - 1] ?? null;

  const recentSubmissions: RecentSubmissionItem[] = (
    (submissionRows ?? []) as SubmissionQueryRow[]
  ).map((row) => ({
    id: row.id,
    taskId: row.task?.id ?? row.task_id,
    taskTitle: row.task?.title ?? "Task submission",
    status: row.status,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  }));

  const mentorRow = mentor as {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;

  return {
    userId,
    mentor: {
      id: mentorId,
      name: mentorRow?.name ?? "Your mentor",
      avatarUrl: mentorRow?.avatar_url ?? null,
    },
    messages: thread,
    unreadFromMentor: unreadCount ?? 0,
    lastMessagePreview: last ? truncatePreview(last.content) : null,
    lastMessageAt: last?.created_at ?? null,
    context: {
      courseTitle: context.courseTitle,
      milestoneTitle: context.milestoneTitle,
      milestoneIndex: context.milestoneIndex,
      milestoneTotal: context.milestoneTotal,
      currentLessonTitle: context.currentLessonTitle,
      currentTaskTitle: context.currentTaskTitle,
      continueHref: context.continueHref,
      completionPercent: context.completionPercent,
    },
    recentSubmissions,
  };
}
