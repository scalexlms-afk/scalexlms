import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { TextArea } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getConversationWithStudent,
  getMentorMessageInbox,
  getStudentMentorId,
} from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { Button, Card, StatusPill } from "@scalex/ui";
import { replyToStudentAction } from "@/app/students/actions";

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
            Premium students message their mentor directly. Reply here or from
            the student profile.
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
            <Card className="!p-0 overflow-hidden">
              <ul className="divide-y divide-line">
                {threads.map((thread) => {
                  const active = thread.studentId === selectedId;
                  return (
                    <li key={thread.studentId}>
                      <Link
                        href={`/messages?student=${thread.studentId}`}
                        className={`block px-4 py-3 transition-colors hover:bg-surface-3 ${
                          active ? "bg-surface-3" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">
                            {thread.studentName}
                          </p>
                          <StatusPill
                            label={planLabel(thread.plan, true)}
                            variant={planPillVariant(thread.plan)}
                          />
                        </div>
                        <p className="mt-1 truncate text-xs text-muted">
                          {thread.lastMessage
                            ? `${thread.lastMessage.fromStudent ? "Student" : "You"}: ${thread.lastMessage.content}`
                            : "No messages yet"}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card>
              {selected ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {selected.studentName}
                      </h2>
                      <p className="text-sm text-muted">
                        {selected.studentEmail}
                      </p>
                    </div>
                    <Link
                      href={`/students/${selected.studentId}`}
                      className="text-sm font-medium text-scalex-red hover:underline"
                    >
                      Open profile →
                    </Link>
                  </div>

                  <div className="mt-5 max-h-[420px] space-y-3 overflow-y-auto">
                    {conversation.length === 0 ? (
                      <p className="text-sm text-muted">
                        No messages in this thread yet. Send the first reply
                        below.
                      </p>
                    ) : (
                      conversation.map((msg) => {
                        const row = msg as {
                          id: string;
                          content: string;
                          created_at: string;
                          sender_id: string;
                          sender: { name: string } | null;
                        };
                        const mine = row.sender_id === userId;
                        return (
                          <div
                            key={row.id}
                            className={`rounded-lg border border-line p-3 ${
                              mine ? "bg-surface-3" : "bg-transparent"
                            }`}
                          >
                            <p className="text-xs text-subtle">
                              {mine
                                ? "You"
                                : (row.sender?.name ?? selected.studentName)}{" "}
                              · {formatDateTime(row.created_at)}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm">
                              {row.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form
                    action={replyToStudentAction}
                    className="mt-5 space-y-3 border-t border-line pt-5"
                  >
                    <input
                      type="hidden"
                      name="studentId"
                      value={selected.studentId}
                    />
                    <input type="hidden" name="redirectTo" value="/messages" />
                    <TextArea label="Reply" name="content" rows={3} required />
                    <Button type="submit">Send reply</Button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted">Select a student thread.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
