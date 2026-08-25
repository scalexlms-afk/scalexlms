import { createClient } from "@scalex/db/server";
import { isPremiumPlan } from "@scalex/db";
import type { Profile } from "@scalex/db/types";
import type {
  ConversationPreviewData,
  SupportMentorSummary,
  SupportPageData,
  SupportTicketItem,
  TicketPriority,
  TicketStatus,
} from "@/lib/support-shared";
import { truncateSupportPreview } from "@/lib/support-shared";
import { getPublicContactInfo } from "@/lib/contact-settings";

export type {
  ConversationPreviewData,
  SupportMentorSummary,
  SupportPageData,
  SupportTicketItem,
  TicketPriority,
  TicketStatus,
} from "@/lib/support-shared";
export {
  formatSupportThreadTime,
  formatTicketDate,
  formatTicketId,
  mentorInitials,
  ticketStatusLabel,
  ticketStatusVariant,
  truncateSupportPreview,
  TICKET_STATUS_LABELS,
} from "@/lib/support-shared";

type TicketQueryRow = {
  id: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  staff_reply: string | null;
  staff_reply_at: string | null;
  created_at: string;
};

type MessagePreviewRow = {
  content: string;
  created_at: string;
};

export async function getSupportPageData(
  userId: string,
  profile: Profile
): Promise<SupportPageData> {
  const premium = isPremiumPlan(profile.plan);
  const mentorId = profile.mentor_id;
  const supabase = await createClient();

  const contact = await getPublicContactInfo();

  const { data: ticketRows } = await supabase
    .from("support_tickets")
    .select(
      "id, subject, body, status, priority, staff_reply, staff_reply_at, created_at"
    )
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const tickets: SupportTicketItem[] = (
    (ticketRows ?? []) as TicketQueryRow[]
  ).map((row) => ({
    id: row.id,
    subject: row.subject,
    body: row.body,
    status: row.status,
    priority: row.priority,
    staffReply: row.staff_reply,
    staffReplyAt: row.staff_reply_at,
    createdAt: row.created_at,
  }));

  let mentor: SupportMentorSummary | null = null;
  let conversation: ConversationPreviewData | null = null;

  if (mentorId) {
    const { data: mentorRow } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("id", mentorId)
      .maybeSingle();

    const row = mentorRow as {
      id: string;
      name: string;
      avatar_url: string | null;
    } | null;

    mentor = {
      id: mentorId,
      name: row?.name ?? "Your mentor",
      avatarUrl: row?.avatar_url ?? null,
    };

    if (premium) {
      const [{ data: lastMessages }, { count: unreadCount }] =
        await Promise.all([
          supabase
            .from("messages")
            .select("content, created_at")
            .or(
              `and(sender_id.eq.${userId},recipient_id.eq.${mentorId}),and(sender_id.eq.${mentorId},recipient_id.eq.${userId})`
            )
            .order("created_at", { ascending: false })
            .limit(1),
          supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("recipient_id", userId)
            .eq("sender_id", mentorId)
            .is("read_at", null),
        ]);

      const last = ((lastMessages ?? []) as MessagePreviewRow[])[0] ?? null;
      conversation = {
        lastMessagePreview: last
          ? truncateSupportPreview(last.content)
          : null,
        lastMessageAt: last?.created_at ?? null,
        unreadFromMentor: unreadCount ?? 0,
      };
    }
  }

  return {
    userId,
    plan: profile.plan,
    premium,
    hasMentor: Boolean(mentorId),
    mentor,
    tickets,
    conversation,
    contact,
  };
}
