import { requireStudentProfile } from "@/lib/auth";
import { getSupportPageData } from "@/lib/support";
import { SupportWorkspace } from "@/components/support/support-workspace";
import { createSupportTicketAction } from "./actions";

export default async function StudentSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { userId, profile } = await requireStudentProfile();
  const params = await searchParams;
  const data = await getSupportPageData(userId, profile);

  return (
    <div className="academy-page">
      <SupportWorkspace
        data={data}
        createTicketAction={createSupportTicketAction}
        flash={{
          sent: params.sent === "1",
          error: params.error ?? null,
        }}
      />
    </div>
  );
}
