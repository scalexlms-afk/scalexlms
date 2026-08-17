import Link from "next/link";
import { StaffChatPanel } from "@/components/staff-chat-panel";
import {
  AdminDetailRail,
  AdminEmptyState,
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
  searchParams: Promise<{ student?: string; sent?: string; tab?: string; q?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const params = await searchParams;
  const tab = params.tab === "students" ? "students" : "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const threads = await getMentorMessageInbox({ userId, role: profile.role });
  const visibleThreads = threads.filter((thread) => {
    if (tab === "students" && thread.plan !== "premium") return false;
    if (!q) return true;
    return (
      thread.studentName.toLowerCase().includes(q) ||
      thread.studentEmail.toLowerCase().includes(q)
    );
  });
  const selectedId =
    params.student && visibleThreads.some((t) => t.studentId === params.student)
      ? params.student
      : (visibleThreads.find((t) => t.lastMessage)?.studentId ??
        visibleThreads[0]?.studentId);

  const selected = visibleThreads.find((t) => t.studentId === selectedId) ?? null;

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
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Messages"
        description="Mentor and staff conversations with Premium students."
        search={{
          action: "/messages",
          placeholder: "Search conversations...",
          defaultValue: params.q ?? "",
          hiddenFields: tab !== "all" ? { tab } : undefined,
        }}
      />

      <AdminKpiGrid
        items={[
          { label: "Total Conversations", value: String(threads.length) },
          {
            label: "Active Threads",
            value: String(threads.filter((t) => t.lastMessage).length),
            tone: "info",
          },
          {
            label: "Premium Students",
            value: String(threads.filter((t) => t.plan === "premium").length),
            tone: "success",
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
          <AdminEmptyState
            title="No student threads yet"
            hint="Premium students with an assigned mentor appear here."
            action={
              <Link href="/students" className="admin-btn-secondary">
                Open students
              </Link>
            }
          />
        </AdminPanel>
      ) : (
        <div className="grid min-h-[560px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <AdminPanel>
            <AdminFilterTabs
              active={tab}
              tabs={[
                { id: "all", label: "All", href: "/messages?tab=all" },
                {
                  id: "students",
                  label: "Premium",
                  href: "/messages?tab=students",
                },
              ]}
            />
            <div className="mt-3">
              {visibleThreads.length === 0 ? (
                <AdminEmptyState
                  title="No matching conversations"
                  hint="Try another search or switch tabs."
                />
              ) : (
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
              )}
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
              <div className="min-h-[420px]">
                <StaffChatPanel
                  userId={userId}
                  peerId={selected.studentId}
                  peerName={selected.studentName}
                  initialMessages={(conversation ?? []) as never}
                  sendAction={sendAction}
                  markReadAction={markReadAction}
                />
              </div>
            </AdminPanel>
          ) : (
            <AdminPanel>
              <AdminEmptyState
                title="Pick a student"
                hint="Select a conversation from the list to reply."
              />
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
              <AdminEmptyState
                title="No conversation selected"
                hint="Choose a thread to see student details."
              />
            )}
          </AdminDetailRail>
        </div>
      )}
    </>
  );
}
