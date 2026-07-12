import { AdminShell } from "@/components/admin-shell";
import { Field } from "@/components/field";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import {
  getAdminUsers,
  getPaymentPlanSettings,
  getRecentAuditLogs,
} from "@/lib/data";
import { formatCurrency, formatDateTime, formatRole } from "@/lib/format";
import { updatePaymentPlanAction, updateUserRoleAction } from "./actions";
import { Button, Card, DataTable } from "@scalex/ui";

export default async function SettingsPage() {
  const { profile } = await requireAdminProfile();
  requireFeature(profile.role, "system_settings", "full");

  const [users, planSettings, auditLogs] = await Promise.all([
    getAdminUsers(),
    getPaymentPlanSettings(),
    getRecentAuditLogs(),
  ]);

  return (
    <AdminShell activePath="/settings">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            System Settings
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Role management, payment plan configuration, and audit trail.
          </p>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Admin Users</h2>
          <div className="mt-4">
            <DataTable
              rows={users}
              getRowKey={(row) => row.id}
              columns={[
                {
                  key: "name",
                  header: "Name",
                  render: (row) => row.name,
                },
                {
                  key: "email",
                  header: "Email",
                  render: (row) => row.email,
                },
                {
                  key: "role",
                  header: "Role",
                  render: (row) => (
                    <form action={updateUserRoleAction} className="flex gap-2">
                      <input type="hidden" name="userId" value={row.id} />
                      <select
                        name="role"
                        defaultValue={row.role}
                        className="rounded border border-white/10 bg-scalex-charcoal-alt px-2 py-1 text-xs"
                      >
                        <option value="super_admin">Super Admin</option>
                        <option value="instructor">Instructor</option>
                        <option value="mentor">Mentor</option>
                        <option value="sales">Sales</option>
                      </select>
                      <Button type="submit" className="!px-2 !py-1 text-xs">
                        Save
                      </Button>
                    </form>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => formatRole(row.status),
                },
              ]}
            />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">
            Payment Plan Settings
          </h2>
          <div className="mt-4 space-y-4">
            {planSettings.map((plan) => (
              <form
                key={plan.id}
                action={updatePaymentPlanAction}
                className="grid gap-3 rounded-xl border border-white/[0.06] bg-scalex-charcoal-alt p-4 sm:grid-cols-4"
              >
                <input type="hidden" name="planId" value={plan.id} />
                <div>
                  <p className="text-xs text-text-tertiary-dark">Plan Key</p>
                  <p className="font-medium">{plan.plan_key}</p>
                </div>
                <Field
                  label="Total (cents)"
                  name="totalCents"
                  type="number"
                  defaultValue={String(plan.total_cents)}
                />
                <Field
                  label="First %"
                  name="firstPercent"
                  type="number"
                  defaultValue={String(plan.first_payment_percent)}
                />
                <Field
                  label="Remaining %"
                  name="remainingPercent"
                  type="number"
                  defaultValue={String(plan.remaining_percent)}
                />
                <div className="sm:col-span-4">
                  <p className="text-xs text-text-secondary-dark">
                    Current: {formatCurrency(plan.total_cents)} ·{" "}
                    {plan.first_payment_percent}% first /{" "}
                    {plan.remaining_percent}% remaining
                  </p>
                  <Button type="submit" className="mt-2">
                    Update plan
                  </Button>
                </div>
              </form>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold">Recent Audit Log</h2>
          <div className="mt-4">
            <DataTable
              rows={auditLogs}
              getRowKey={(row) => row.id}
              emptyMessage="No audit entries yet."
              columns={[
                {
                  key: "action",
                  header: "Action",
                  render: (row) => row.action,
                },
                {
                  key: "target",
                  header: "Target",
                  render: (row) => `${row.target_type}:${row.target_id.slice(0, 8)}`,
                },
                {
                  key: "actor",
                  header: "Actor",
                  render: (row) =>
                    (row.actor as { name: string } | null)?.name ?? "—",
                },
                {
                  key: "when",
                  header: "When",
                  render: (row) => formatDateTime(row.created_at),
                },
              ]}
            />
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
