import { PortalShell } from "@/components/portal-shell";
import { Field, TextArea } from "@/components/field";
import { requireStudentProfile } from "@/lib/auth";
import { createClient } from "@scalex/db/server";
import { isPremiumPlan, planLabel, planPillVariant } from "@scalex/db";
import { Button, Card, StatusPill } from "@scalex/ui";
import { createSupportTicketAction } from "./actions";

export default async function StudentSupportPage() {
  const { userId, profile } = await requireStudentProfile();
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  return (
    <PortalShell activePath="/support">
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Support
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
              Support tickets
            </h1>
            <p className="mt-1 text-muted">
              {isPremiumPlan(profile.plan)
                ? "Premium priority support — we triage your tickets first."
                : "Open a ticket and our team will follow up."}
            </p>
          </div>
          <StatusPill
            label={planLabel(profile.plan)}
            variant={planPillVariant(profile.plan)}
          />
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">New ticket</h2>
          <form action={createSupportTicketAction} className="mt-4 space-y-4">
            <Field label="Subject" name="subject" required />
            <TextArea label="Message" name="body" rows={4} required />
            <Button type="submit">Submit ticket</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Your tickets</h2>
          {(tickets ?? []).length === 0 ? (
            <Card>
              <p className="text-sm text-muted">No tickets yet.</p>
            </Card>
          ) : (
            (tickets ?? []).map((ticket) => (
              <Card key={(ticket as { id: string }).id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-medium">
                    {(ticket as { subject: string }).subject}
                  </h3>
                  <div className="flex gap-2">
                    {(ticket as { priority: string }).priority === "high" && (
                      <StatusPill label="Priority" variant="review" />
                    )}
                    <StatusPill
                      label={String(
                        (ticket as { status: string }).status
                      ).replace(/_/g, " ")}
                      variant="neutral"
                    />
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                  {(ticket as { body: string }).body}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </PortalShell>
  );
}
