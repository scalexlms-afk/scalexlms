import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AdminEmptyState,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getMentorMessageInbox } from "@/lib/data";
import { planLabel, planPillVariant } from "@scalex/db";
import {
  ConversationList,
  ConversationListItem,
  StatusPill,
} from "@scalex/ui";

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

  if (params.student) {
    redirect(`/messages/${params.student}`);
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Messages"
        description="Mentor and staff conversations with Premium students. Open a thread for a full-width chat."
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
                    href={`/messages/${thread.studentId}`}
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
      )}
    </>
  );
}
