import { AdminShell } from "@/components/admin-shell";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getSupportTickets } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { Button, Card, StatusPill } from "@scalex/ui";
import { updateTicketStatusAction } from "./actions";

export default async function AdminSupportPage() {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const tickets = await getSupportTickets({ userId, role: profile.role });

  return (
    <AdminShell activePath="/support">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Support
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Support tickets
          </h1>
          <p className="mt-1 text-muted">
            Premium tickets are marked high priority.
          </p>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No support tickets yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const student = ticket.student as {
                name: string;
                email: string;
                plan: string | null;
              } | null;
              return (
                <Card key={ticket.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {ticket.subject}
                      </h2>
                      <p className="mt-0.5 text-sm text-muted">
                        {student?.name ?? "Student"}
                        {student?.email ? ` · ${student.email}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusPill
                          label={planLabel(student?.plan, true)}
                          variant={planPillVariant(student?.plan)}
                        />
                        {ticket.priority === "high" && (
                          <StatusPill label="High priority" variant="review" />
                        )}
                        <StatusPill
                          label={String(ticket.status).replace(/_/g, " ")}
                          variant="neutral"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-subtle">
                      {formatDateTime(ticket.created_at as string)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
                    {ticket.body as string}
                  </p>
                  <form
                    action={updateTicketStatusAction}
                    className="mt-4 flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <select
                      name="status"
                      defaultValue={ticket.status as string}
                      className="rounded-lg border border-line bg-surface-3 px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <Button type="submit" className="!px-3 !py-2 text-sm">
                      Update status
                    </Button>
                  </form>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
