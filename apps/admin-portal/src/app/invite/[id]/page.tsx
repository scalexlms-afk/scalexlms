import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { formatRole } from "@/lib/format";
import { getServiceDb } from "@/lib/admin-db";
import { AcceptInviteForm } from "./invite-form";

export default async function AcceptStaffInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const db = getServiceDb();
  const { data: invite } = await db
    .from("staff_invites")
    .select("id, email, role, accepted_at, expires_at")
    .eq("id", id)
    .maybeSingle();

  const expired =
    invite != null && new Date(invite.expires_at).getTime() < Date.now();
  const accepted = Boolean(invite?.accepted_at);

  let unavailable: string | null = null;
  if (!invite) unavailable = "This invite was not found.";
  else if (accepted) unavailable = "This invite has already been accepted.";
  else if (expired) unavailable = "This invite has expired.";

  if (unavailable || !invite) {
    return (
      <AuthShell
        title="Invite unavailable"
        subtitle="This link is no longer valid."
        footer={
          <Link href="/login" className="text-scalex-red hover:underline">
            Back to sign in
          </Link>
        }
      >
        <p className="mt-6 rounded-lg border border-line bg-surface-3 px-3 py-2 text-sm text-muted">
          {unavailable}
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Accept staff invite"
      subtitle={`Create your ${formatRole(invite.role)} account for ScaleX Management OS.`}
      footer={
        <Link href="/login" className="text-scalex-red hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AcceptInviteForm
        inviteId={invite.id}
        email={invite.email}
        error={error}
      />
    </AuthShell>
  );
}
