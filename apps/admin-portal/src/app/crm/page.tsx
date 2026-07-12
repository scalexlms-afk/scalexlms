import { AdminShell } from "@/components/admin-shell";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { LEAD_STAGE_LABELS, LEAD_STAGES } from "@/lib/admin-db";
import { getLeads } from "@/lib/data";
import { formatDate } from "@/lib/format";
import {
  createLeadAction,
  updateLeadAction,
  updateLeadStageAction,
} from "./actions";
import { Button, Card, DataTable, PipelineBoard } from "@scalex/ui";

export default async function CrmPage() {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "crm");

  const leads = await getLeads({ userId, role: profile.role });
  const columns = LEAD_STAGES.map((stage) => ({
    id: stage,
    title: LEAD_STAGE_LABELS[stage],
    items: leads.filter((lead) => lead.stage === stage),
  }));

  return (
    <AdminShell activePath="/crm">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            CRM
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Lead Pipeline
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Track prospects from first contact to enrollment.
          </p>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Add Lead</h2>
          <form action={createLeadAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Email" name="email" type="email" />
            <Field label="WhatsApp" name="whatsapp" />
            <Field label="Source" name="source" placeholder="Meta Ads, Referral..." />
            <div className="sm:col-span-2">
              <TextArea label="Notes" name="notes" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create lead</Button>
            </div>
          </form>
        </Card>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">
            Pipeline Board
          </h2>
          <PipelineBoard
            columns={columns}
            getItemKey={(lead) => lead.id}
            renderCard={(lead) => (
              <div>
                <p className="font-medium">{lead.name}</p>
                <p className="mt-1 text-xs text-text-tertiary-dark">
                  {lead.source ?? "Unknown source"}
                </p>
                {lead.whatsapp && (
                  <p className="mt-1 text-xs text-text-secondary-dark">
                    {lead.whatsapp}
                  </p>
                )}
                <form action={updateLeadStageAction} className="mt-2 flex gap-1">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <select
                    name="stage"
                    defaultValue={lead.stage}
                    className="flex-1 rounded border border-white/10 bg-scalex-black px-2 py-1 text-xs"
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
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">All Leads</h2>
          <div className="mt-4">
            <DataTable
              rows={leads}
              getRowKey={(row) => row.id}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (row) => row.name,
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
                {
                  key: "edit",
                  header: "Edit",
                  render: (row) => (
                    <form action={updateLeadAction} className="flex flex-wrap gap-2">
                      <input type="hidden" name="leadId" value={row.id} />
                      <input type="hidden" name="email" value={row.email ?? ""} />
                      <input type="hidden" name="whatsapp" value={row.whatsapp ?? ""} />
                      <input type="hidden" name="source" value={row.source ?? ""} />
                      <input
                        name="name"
                        defaultValue={row.name}
                        className="w-28 rounded border border-white/10 bg-scalex-charcoal-alt px-2 py-1 text-xs"
                      />
                      <input
                        name="notes"
                        defaultValue={row.notes ?? ""}
                        placeholder="Notes"
                        className="w-32 rounded border border-white/10 bg-scalex-charcoal-alt px-2 py-1 text-xs"
                      />
                      <Button type="submit" className="!px-2 !py-1 text-xs">
                        Save
                      </Button>
                    </form>
                  ),
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
