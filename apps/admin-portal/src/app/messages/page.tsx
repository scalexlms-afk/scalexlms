import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { StaffChatPanel } from "@/components/staff-chat-panel";
import {
  AdminDetailRail,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getConversationWithStudent,
  getMentorMessageInbox,
  getStudentMentorId,
} from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import {
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
  searchParams: Promise<{ student?: string; sent?: string; tab?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const params = await searchParams;
  const tab =
    params.tab === "unread" || params.tab === "students" ? params.tab : "all";
  const threads = await getMentorMessageInbox({ userId, role: profile.role });
  const selectedId =
    params.student && threads.some((t) => t.studentId === params.student)
      ? params.student
      : (threads.find((t) => t.lastMessage)?.studentId ??
        threads[0]?.studentId);

  const selected = threads.find((t) => t.studentId === selectedId) ?? null;
  // Unread counts require a dedicated read-receipt query; UI tab is ready.
  const unread = 0;
  const visibleThreads =
    tab === "students"
      ? threads.filter((t) => t.plan === "premium")
      : threads;

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
      <AdminPageHeader
        eyebrow="Engagement"
        title="Messages"
        description="Mentor and staff conversations with Premium students."
        searchPlaceholder="Search conversations..."
        primaryAction={{ label: "New Message" }}
      />

      <AdminKpiGrid
        items={[
          { label: "Total Conversations", value: String(threads.length) },
          {
            label: "Unread",
            value: String(unread),
            tone: unread > 0 ? "danger" : "default",
          },
          {
            label: "Active Threads",
            value: String(threads.filter((t) => t.lastMessage).length),
          },
          {
            label: "Premium Students",
            value: String(threads.filter((t) => t.plan === "premium").length),
          },
        ]}
      />

      {params.sent ? (
        <div className="rounded-xl border border-accent-green/40 bg-accent-green/5 px-4 py-3 text-sm text-accent-green">
          Reply sent to student.
        </div>
      ) : null}

      {threads.length === 0 ? (
        <AdminPanel>
          <p className="text-sm text-muted">No Premium students assigned yet.</p>
        </AdminPanel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <AdminPanel>
            <AdminFilterTabs
              active={tab}
              tabs={[
                { id: "all", label: "All", href: "/messages?tab=all" },
                {
                  id: "unread",
                  label: "Unread",
                  count: unread,
                  href: "/messages?tab=unread",
                },
                {
                  id: "students",
                  label: "Premium",
                  href: "/messages?tab=students",
                },
              ]}
            />
            <div className="mt-3">
              <ConversationList>
                {visibleThreads.map((thread) => (
                  <ConversationListItem
                    key={thread.studentId}
                    href={`/messages?tab=${tab}&student=${thread.studentId}`}
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
            </div>
          </AdminPanel>

          {selected ? (
            <AdminPanel
              title={selected.studentName}
              action={
                <StatusPill
                  label={planLabel(selected.plan, true)}
                  variant={planPillVariant(selected.plan)}
                />
              }
            >
              <p className="mb-3 text-sm text-muted">{selected.studentEmail}</p>
              <StaffChatPanel
                userId={userId}
                peerId={selected.studentId}
                peerName={selected.studentName}
                initialMessages={(conversation ?? []) as never}
                sendAction={sendAction}
                markReadAction={markReadAction}
              />
            </AdminPanel>
          ) : (
            <AdminPanel>
              <p className="text-sm text-muted">Select a student thread.</p>
            </AdminPanel>
          )}

          <AdminDetailRail title="Conversation Details">
            {selected ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    About
                  </p>
                  <p className="mt-1 font-medium">{selected.studentName}</p>
                  <p className="text-xs text-muted">{selected.studentEmail}</p>
                  <div className="mt-2">
                    <StatusPill
                      label={planLabel(selected.plan, true)}
                      variant={planPillVariant(selected.plan)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href={`/students/${selected.studentId}`}
                    className="admin-btn-secondary w-full text-center"
                  >
                    View Student Profile
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Select a conversation.</p>
            )}
          </AdminDetailRail>
        </div>
      )}
    </AdminShell>
  );
}
