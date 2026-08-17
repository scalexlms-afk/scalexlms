import {
  AdminDetailRail,
  AdminFilterTabs,
  AdminKpiGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
} from "@/components/admin-ui";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import { LEAD_STAGE_LABELS, LEAD_STAGES } from "@/lib/admin-db";
import { getLeads } from "@/lib/data";
import { formatDate } from "@/lib/format";
import {
  createLeadAction,
  updateLeadAction,
  updateLeadStageAction,
} from "./actions";
import { Button, DataTable, PipelineBoard } from "@scalex/ui";
import Link from "next/link";

type CrmTab = "pipeline" | "new" | "demo" | "enrolled" | "all";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; lead?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "crm");

  const params = await searchParams;
  const tab: CrmTab =
    params.tab === "new" ||
    params.tab === "demo" ||
    params.tab === "enrolled" ||
    params.tab === "all"
      ? params.tab
      : "pipeline";

  const leads = await getLeads({ userId, role: profile.role });
  const columns = LEAD_STAGES.map((stage) => ({
    id: stage,
    title: LEAD_STAGE_LABELS[stage],
    items: leads.filter((lead) => lead.stage === stage),
  }));

  const newLeads = leads.filter((l) => l.stage === "new_lead");
  const demo = leads.filter((l) => l.stage === "demo");
  const paymentPending = leads.filter((l) => l.stage === "payment_pending");
  const enrolled = leads.filter((l) => l.stage === "enrolled");

  const listForTab =
    tab === "new"
      ? newLeads
      : tab === "demo"
        ? demo
        : tab === "enrolled"
          ? enrolled
          : leads;

  const selected =
    listForTab.find((l) => l.id === params.lead) ?? listForTab[0] ?? null;

  return (
    <>
      <AdminPageHeader
        eyebrow="Business"
        title="Lead Pipeline"
        description="Track prospects from first contact through enrollment."
        searchPlaceholder="Search leads..."
        primaryAction={{ label: "+ Add Lead" }}
      />

      <AdminKpiGrid
        items={[
          { label: "Total Leads", value: String(leads.length) },
          {
            label: "New",
            value: String(newLeads.length),
            hint: "Fresh in the funnel",
          },
          { label: "Demo", value: String(demo.length) },
          {
            label: "Payment Pending",
            value: String(paymentPending.length),
            tone: paymentPending.length > 0 ? "danger" : "default",
          },
          {
            label: "Enrolled",
            value: String(enrolled.length),
            tone: "success",
          },
        ]}
      />

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "pipeline",
            label: "Pipeline",
            count: leads.length,
            href: "/crm?tab=pipeline",
          },
          {
            id: "new",
            label: "New",
            count: newLeads.length,
            href: "/crm?tab=new",
          },
          {
            id: "demo",
            label: "Demo",
            count: demo.length,
            href: "/crm?tab=demo",
          },
          {
            id: "enrolled",
            label: "Enrolled",
            count: enrolled.length,
            href: "/crm?tab=enrolled",
          },
          {
            id: "all",
            label: "All Leads",
            count: leads.length,
            href: "/crm?tab=all",
          },
        ]}
      />

      {tab === "pipeline" ? (
        <div className="space-y-4">
          <AdminPanel title="Add Lead">
            <form
              action={createLeadAction}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" />
              <Field label="WhatsApp" name="whatsapp" />
              <Field
                label="Source"
                name="source"
                placeholder="Meta Ads, Referral..."
              />
              <div className="sm:col-span-2">
                <TextArea label="Notes" name="notes" rows={2} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Create lead</Button>
              </div>
            </form>
          </AdminPanel>

          <AdminPanel title="Pipeline Board">
            <PipelineBoard
              columns={columns}
              getItemKey={(lead) => lead.id}
              renderCard={(lead) => (
                <div>
                  <Link
                    href={`/crm?tab=pipeline&lead=${lead.id}`}
                    className="font-medium hover:text-scalex-red"
                  >
                    {lead.name}
                  </Link>
                  <p className="mt-1 text-xs text-subtle">
                    {lead.source ?? "Unknown source"}
                  </p>
                  {lead.whatsapp && (
                    <p className="mt-1 text-xs text-muted">{lead.whatsapp}</p>
                  )}
                  <form
                    action={updateLeadStageAction}
                    className="mt-2 flex gap-1"
                  >
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select
                      name="stage"
                      defaultValue={lead.stage}
                      className="flex-1 rounded border border-line bg-surface px-2 py-1 text-xs"
                    >
                      {LEAD_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {LEAD_STAGE_LABELS[stage]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded bg-scalex-red/20 px-2 py-1 text-xs text-scalex-red"
                    >
                      Move
                    </button>
                  </form>
                </div>
              )}
            />
          </AdminPanel>

          {selected ? (
            <AdminPanel title="Selected lead">
              <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
                <div className="text-sm">
                  <p className="font-display text-lg font-semibold">
                    {selected.name}
                  </p>
                  <p className="mt-1 text-muted">
                    {selected.email ?? selected.whatsapp ?? "No contact"}
                  </p>
                  <p className="mt-2 text-xs text-subtle">
                    {LEAD_STAGE_LABELS[selected.stage]} ·{" "}
                    {selected.source ?? "Unknown source"} · Created{" "}
                    {formatDate(selected.created_at)}
                  </p>
                  {selected.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-muted">
                      {selected.notes}
                    </p>
                  ) : null}
                </div>
                <form action={updateLeadAction} className="space-y-2">
                  <input type="hidden" name="leadId" value={selected.id} />
                  <input
                    type="hidden"
                    name="email"
                    value={selected.email ?? ""}
                  />
                  <input
                    type="hidden"
                    name="whatsapp"
                    value={selected.whatsapp ?? ""}
                  />
                  <input
                    type="hidden"
                    name="source"
                    value={selected.source ?? ""}
                  />
                  <Field
                    label="Name"
                    name="name"
                    defaultValue={selected.name}
                  />
                  <Field
                    label="Notes"
                    name="notes"
                    defaultValue={selected.notes ?? ""}
                  />
                  <Button type="submit">Save Changes</Button>
                </form>
              </div>
            </AdminPanel>
          ) : null}
        </div>
      ) : (
        <AdminSplit
          main={
            <AdminPanel title="Leads">
              <DataTable
                rows={listForTab}
                getRowKey={(row) => row.id}
                emptyMessage="No leads in this stage."
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    render: (row) => (
                      <Link
                        href={`/crm?tab=${tab}&lead=${row.id}`}
                        className={
                          selected?.id === row.id
                            ? "font-semibold text-scalex-red"
                            : "hover:text-scalex-red"
                        }
                      >
                        {row.name}
                      </Link>
                    ),
                  },
                  {
                    key: "contact",
                    header: "Contact",
                    render: (row) => row.email ?? row.whatsapp ?? "—",
                  },
                  {
                    key: "source",
                    header: "Source",
                    render: (row) => row.source ?? "—",
                  },
                  {
                    key: "stage",
                    header: "Stage",
                    render: (row) => LEAD_STAGE_LABELS[row.stage],
                  },
                  {
                    key: "sales",
                    header: "Sales Rep",
                    render: (row) => row.sales?.name ?? "—",
                  },
                  {
                    key: "created",
                    header: "Created",
                    render: (row) => formatDate(row.created_at),
                  },
                ]}
              />
            </AdminPanel>
          }
          rail={
            selected ? (
              <AdminDetailRail title="Lead detail">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-display text-base font-semibold">
                      {selected.name}
                    </p>
                    <p className="text-xs text-muted">
                      {selected.email ?? "—"}
                    </p>
                    <p className="text-xs text-muted">
                      {selected.whatsapp ?? "—"}
                    </p>
                  </div>
                  <p className="text-xs text-subtle">
                    {LEAD_STAGE_LABELS[selected.stage]} ·{" "}
                    {selected.source ?? "Unknown"}
                  </p>
                  <form action={updateLeadStageAction} className="space-y-2">
                    <input type="hidden" name="leadId" value={selected.id} />
                    <select
                      name="stage"
                      defaultValue={selected.stage}
                      className="w-full rounded-lg border border-line bg-surface-3 px-3 py-2 text-sm"
                    >
                      {LEAD_STAGES.map((stage) => (
                        <option key={stage} value={stage}>
                          {LEAD_STAGE_LABELS[stage]}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" className="w-full">
                      Move stage
                    </Button>
                  </form>
                  <form action={updateLeadAction} className="space-y-2">
                    <input type="hidden" name="leadId" value={selected.id} />
                    <input
                      type="hidden"
                      name="email"
                      value={selected.email ?? ""}
                    />
                    <input
                      type="hidden"
                      name="whatsapp"
                      value={selected.whatsapp ?? ""}
                    />
                    <input
                      type="hidden"
                      name="source"
                      value={selected.source ?? ""}
                    />
                    <Field
                      label="Name"
                      name="name"
                      defaultValue={selected.name}
                    />
                    <Field
                      label="Notes"
                      name="notes"
                      defaultValue={selected.notes ?? ""}
                    />
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </div>
              </AdminDetailRail>
            ) : (
              <AdminPanel>
                <p className="text-sm text-muted">Select a lead.</p>
              </AdminPanel>
            )
          }
        />
      )}
    </>
  );
}
