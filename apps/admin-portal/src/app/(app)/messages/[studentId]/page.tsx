import Link from "next/link";
import { notFound } from "next/navigation";
import { StaffChatPanel } from "@/components/staff-chat-panel";
import {
  AdminDetailRail,
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
import { StatusPill } from "@scalex/ui";
import {
  markStudentThreadReadAction,
  sendStudentChatAction,
} from "../actions";

export default async function StudentChatPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const threads = await getMentorMessageInbox({ userId, role: profile.role });
  const selected = threads.find((t) => t.studentId === studentId);
  if (!selected) notFound();

  const partnerId =
    profile.role === "mentor"
      ? userId
      : ((await getStudentMentorId(selected.studentId)) ?? userId);
  const conversation = await getConversationWithStudent(
    selected.studentId,
    partnerId
  );

  const sendAction = sendStudentChatAction.bind(null, selected.studentId);
  const markReadAction = markStudentThreadReadAction.bind(
    null,
    selected.studentId
  );

  return (
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title={selected.studentName}
        description={selected.studentEmail}
        secondaryAction={
          <Link href="/messages" className="admin-btn-secondary">
            ← All conversations
          </Link>
        }
      />

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <AdminPanel
          title="Chat"
          action={
            <StatusPill
              label={planLabel(selected.plan, true)}
              variant={planPillVariant(selected.plan)}
            />
          }
        >
          <div className="min-h-[480px]">
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

        <AdminDetailRail title="Conversation Details">
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
            <Link
              href={`/students/${selected.studentId}`}
              className="admin-btn-secondary w-full text-center"
            >
              View Student Profile
            </Link>
          </div>
        </AdminDetailRail>
      </div>
    </>
  );
}
