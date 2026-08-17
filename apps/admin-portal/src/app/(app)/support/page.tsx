import Link from "next/link";
import { TextArea } from "@/components/field";
import {
  AdminDetailRail,
  AdminEmptyState,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { getSupportTickets } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { Button, StatusPill } from "@scalex/ui";
import { updateTicketStatusAction } from "./actions";

type TicketTab = "all" | "open" | "progress" | "resolved";

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; id?: string; q?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "student_management");

  const params = await searchParams;
  const tab: TicketTab =
    params.tab === "open" ||
    params.tab === "progress" ||
    params.tab === "resolved"
      ? params.tab
      : "all";

  const tickets = await getSupportTickets({ userId, role: profile.role });
  const open = tickets.filter((t) => t.status === "open");
  const inProgress = tickets.filter((t) => t.status === "in_progress");
  const resolved = tickets.filter((t) =>
    ["resolved", "closed"].includes(String(t.status))
  );

  const visible =
    tab === "open"
      ? open
      : tab === "progress"
        ? inProgress
        : tab === "resolved"
          ? resolved
          : tickets;
  const q = (params.q ?? "").trim().toLowerCase();
  const searched = q
    ? visible.filter((ticket) => {
        const student = ticket.student as { name?: string; email?: string } | null;
        return (
          ticket.subject.toLowerCase().includes(q) ||
          (student?.name ?? "").toLowerCase().includes(q) ||
          (student?.email ?? "").toLowerCase().includes(q)
        );
      })
    : visible;

  const selected =
    searched.find((t) => t.id === params.id) ?? searched[0] ?? null;

  const highPriority = tickets.filter((t) => t.priority === "high").length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Engagement"
        title="Support Tickets"
        description="Premium tickets are high priority. Reply so students see your response."
        search={{
          action: "/support",
          placeholder: "Search tickets...",
          defaultValue: params.q ?? "",
          hiddenFields: tab !== "all" ? { tab } : undefined,
        }}
      />

      <AdminKpiGrid
        items={[
          { label: "My Tickets", value: String(tickets.length) },
          {
            label: "Open Tickets",
            value: String(open.length),
            tone: open.length > 0 ? "danger" : "default",
          },
          { label: "In Progress", value: String(inProgress.length) },
          {
            label: "Resolved",
            value: String(resolved.length),
            tone: "success",
          },
          {
            label: "High Priority",
            value: String(highPriority),
            tone: highPriority > 0 ? "danger" : "default",
          },
        ]}
      />

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "all",
            label: "All Tickets",
            count: tickets.length,
            href: "/support?tab=all",
          },
          {
            id: "open",
            label: "Open",
            count: open.length,
            href: "/support?tab=open",
          },
          {
            id: "progress",
            label: "In Progress",
            count: inProgress.length,
            href: "/support?tab=progress",
          },
          {
            id: "resolved",
            label: "Resolved",
            count: resolved.length,
            href: "/support?tab=resolved",
          },
        ]}
      />

      {searched.length === 0 ? (
        <AdminPanel>
          <AdminEmptyState
            title={q ? "No matching tickets" : "No support tickets in this view"}
            hint="Premium student tickets appear here for staff reply."
          />
        </AdminPanel>
      ) : (
        <AdminSplit
          main={
            <div className="space-y-3">
              {searched.map((ticket) => {
                const student = ticket.student as {
                  name: string;
                  email: string;
                  plan: string | null;
                } | null;
                const active = selected?.id === ticket.id;
                return (
                  <Link
                    key={ticket.id}
                    href={`/support?tab=${tab}&id=${ticket.id}`}
                    className={`block rounded-2xl border px-4 py-3 transition ${
                      active
                        ? "border-scalex-red/40 bg-scalex-red/5"
                        : "border-line bg-surface-2 hover:bg-surface-3/60"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm font-semibold">
                          {ticket.subject}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {student?.name ?? "Student"}
                          {student?.email ? ` · ${student.email}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.priority === "high" ? (
                          <StatusPill label="High" variant="review" />
                        ) : null}
                        <StatusPill
                          label={String(ticket.status).replace(/_/g, " ")}
                          variant="neutral"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          }
          rail={
            selected ? (
              <AdminDetailRail
                title="Ticket detail"
                footer={
                  <form action={updateTicketStatusAction} className="space-y-3">
                    <input type="hidden" name="ticketId" value={selected.id} />
                    <TextArea
                      label="Reply to student"
                      name="reply"
                      rows={3}
                      placeholder="Optional — student will see this on their Support page"
                      defaultValue={
                        ((selected as { staff_reply?: string | null })
                          .staff_reply as string | null) ?? ""
                      }
                    />
                    <select
                      name="status"
                      defaultValue={selected.status as string}
                      className="w-full rounded-lg border border-line bg-surface-3 px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <Button type="submit" className="w-full">
                      Save update
                    </Button>
                  </form>
                }
              >
                {(() => {
                  const student = selected.student as {
                    name: string;
                    email: string;
                    plan: string | null;
                  } | null;
                  const staffReply = (
                    selected as { staff_reply?: string | null }
                  ).staff_reply;
                  return (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-display text-base font-semibold">
                          {selected.subject}
                        </p>
                        <p className="mt-1 text-xs text-subtle">
                          {formatDateTime(selected.created_at as string)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill
                          label={planLabel(student?.plan, true)}
                          variant={planPillVariant(student?.plan)}
                        />
                        {selected.priority === "high" ? (
                          <StatusPill label="High priority" variant="review" />
                        ) : null}
                      </div>
                      <p className="whitespace-pre-wrap text-muted">
                        {selected.body as string}
                      </p>
                      {staffReply ? (
                        <div className="rounded-lg border border-line bg-surface-3 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                            Previous reply
                          </p>
                          <p className="mt-1 whitespace-pre-wrap">
                            {staffReply}
                          </p>
                        </div>
                      ) : null}
                      {selected.student_id ? (
                        <Link
                          href={`/students/${selected.student_id}`}
                          className="inline-flex text-sm font-semibold text-scalex-red hover:underline"
                        >
                          Open student →
                        </Link>
                      ) : null}
                    </div>
                  );
                })()}
              </AdminDetailRail>
            ) : (
              <AdminPanel>
                <p className="text-sm text-muted">Select a ticket.</p>
              </AdminPanel>
            )
          }
        />
      )}
    </>
  );
}
