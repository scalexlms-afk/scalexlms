import { Field, TextArea } from "@/components/field";
import { requireStudentProfile } from "@/lib/auth";
import { createClient } from "@scalex/db/server";
import { isPremiumPlan, planLabel, planPillVariant } from "@scalex/db";
import { Button, Card, StatusPill } from "@scalex/ui";
import { createSupportTicketAction } from "./actions";

export default async function StudentSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { userId, profile } = await requireStudentProfile();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  return (
    <>
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
                ? "Premium priority support — your assigned mentor is notified first."
                : "Open a ticket and our team will follow up."}
            </p>
          </div>
          <StatusPill
            label={planLabel(profile.plan)}
            variant={planPillVariant(profile.plan)}
          />
        </div>

        {params.error && (
          <Card className="border-scalex-red/40 bg-scalex-red/5">
            <p className="text-sm text-scalex-red">{params.error}</p>
          </Card>
        )}
        {params.sent && (
          <Card className="border-accent-green/40 bg-accent-green/5">
            <p className="text-sm text-accent-green">
              Ticket submitted
              {profile.mentor_id ? " — your mentor has been notified." : "."}
            </p>
          </Card>
        )}

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
            (tickets ?? []).map((ticket) => {
              const row = ticket as {
                id: string;
                subject: string;
                body: string;
                priority: string;
                status: string;
                staff_reply: string | null;
                staff_reply_at: string | null;
                created_at: string;
              };
              return (
                <Card key={row.id}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium">{row.subject}</h3>
                    <div className="flex gap-2">
                      {row.priority === "high" && (
                        <StatusPill label="Priority" variant="review" />
                      )}
                      <StatusPill
                        label={String(row.status).replace(/_/g, " ")}
                        variant="neutral"
                      />
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                    {row.body}
                  </p>
                  <p className="mt-2 text-xs text-subtle">
                    Opened {new Date(row.created_at).toLocaleString()}
                  </p>
                  {row.staff_reply && (
                    <div className="mt-4 rounded-lg border border-line bg-surface-3 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Mentor reply
                        {row.staff_reply_at
                          ? ` · ${new Date(row.staff_reply_at).toLocaleString()}`
                          : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {row.staff_reply}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
