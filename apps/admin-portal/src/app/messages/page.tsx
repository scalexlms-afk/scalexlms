import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { StaffChatPanel } from "@/components/staff-chat-panel";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getConversationWithStudent,
  getMentorMessageInbox,
  getStudentMentorId,
} from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import {
  Card,
  ConversationList,
  ConversationListItem,
  StatusPill,
} from "@scalex/ui";
import {
  markStudentThreadReadAction,
  sendStudentChatAction,
} from "./actions";

export default async function MentorMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; sent?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const params = await searchParams;
  const threads = await getMentorMessageInbox({ userId, role: profile.role });
  const selectedId =
    params.student && threads.some((t) => t.studentId === params.student)
      ? params.student
      : (threads.find((t) => t.lastMessage)?.studentId ??
        threads[0]?.studentId);

  const selected = threads.find((t) => t.studentId === selectedId) ?? null;

  let conversation: Awaited<ReturnType<typeof getConversationWithStudent>> = [];
  if (selected) {
    const partnerId =
      profile.role === "mentor"
        ? userId
        : ((await getStudentMentorId(selected.studentId)) ?? userId);
    conversation = await getConversationWithStudent(
      selected.studentId,
      partnerId
    );
  }

  const sendAction = sendStudentChatAction.bind(null, selectedId ?? "");
  const markReadAction = markStudentThreadReadAction.bind(
    null,
    selectedId ?? ""
  );

  return (
    <AdminShell activePath="/messages">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Mentorship
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Student messages
          </h1>
          <p className="mt-1 text-muted">
            Chat with Premium students assigned to you.
          </p>
        </div>

        {params.sent && (
          <Card className="border-accent-green/40 bg-accent-green/5">
            <p className="text-sm text-accent-green">Reply sent to student.</p>
          </Card>
        )}

        {threads.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              No Premium students assigned yet.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <ConversationList>
              {threads.map((thread) => (
                <ConversationListItem
                  key={thread.studentId}
                  href={`/messages?student=${thread.studentId}`}
                  active={thread.studentId === selectedId}
                  title={thread.studentName}
                  preview={
                    thread.lastMessage
                      ? `${thread.lastMessage.fromStudent ? "Student" : "You"}: ${thread.lastMessage.content}`
                      : "No messages yet"
                  }
                  badge={
                    <StatusPill
                      label={planLabel(thread.plan, true)}
                      variant={planPillVariant(thread.plan)}
                    />
                  }
                />
              ))}
            </ConversationList>

            {selected ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {selected.studentName}
                    </h2>
                    <p className="text-sm text-muted">{selected.studentEmail}</p>
                  </div>
                  <Link
                    href={`/students/${selected.studentId}`}
                    className="text-sm font-medium text-scalex-red hover:underline"
                  >
                    Open profile →
                  </Link>
                </div>
                <StaffChatPanel
                  userId={userId}
                  peerId={selected.studentId}
                  peerName={selected.studentName}
                  initialMessages={(conversation ?? []) as never}
                  sendAction={sendAction}
                  markReadAction={markReadAction}
                />
              </div>
            ) : (
              <Card>
                <p className="text-sm text-muted">Select a student thread.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
