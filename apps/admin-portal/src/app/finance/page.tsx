import { AdminShell } from "@/components/admin-shell";
import { Field, TextArea } from "@/components/field";
import { requireAdminProfile, requireFeature } from "@/lib/auth";
import { canManageFinance } from "@/lib/admin-db";
import {
  getExpenses,
  getPaymentPlanSettings,
  getPayments,
} from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatStatus,
} from "@/lib/format";
import { createExpenseAction, deleteExpenseAction } from "./actions";
import { Button, Card, DataTable, KpiCard, StatusPill } from "@scalex/ui";

export default async function FinancePage() {
  const { profile, userId } = await requireAdminProfile();
  requireFeature(profile.role, "finance");

  const [payments, expenses, planSettings] = await Promise.all([
    getPayments({ userId, role: profile.role }),
    canManageFinance(profile.role) ? getExpenses() : Promise.resolve([]),
    canManageFinance(profile.role) ? getPaymentPlanSettings() : Promise.resolve([]),
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) =>
    ["pending", "overdue"].includes(p.status)
  ).length;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const plan = planSettings[0];

  return (
    <AdminShell activePath="/finance">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Finance
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Payments & Expenses
          </h1>
          <p className="mt-1 text-text-secondary-dark">
            Revenue tracking, installments, and academy expenses.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Revenue" value={formatCurrency(totalRevenue)} />
          <KpiCard
            label="Payment Risk"
            value={String(pendingPayments)}
            iconColor="bg-accent-amber/15 text-accent-amber"
          />
          {canManageFinance(profile.role) && (
            <KpiCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              iconColor="bg-accent-purple/15 text-accent-purple"
            />
          )}
          {plan && (
            <KpiCard
              label="Payment Plan"
              value={`${plan.first_payment_percent}/${plan.remaining_percent}`}
              delta={`${formatCurrency(plan.total_cents)} total`}
            />
          )}
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Payments</h2>
          <div className="mt-4">
            <DataTable
              rows={payments}
              getRowKey={(row) => row.id}
              emptyMessage="No payments found."
              columns={[
                {
                  key: "student",
                  header: "Student",
                  render: (row) => row.student?.name ?? "—",
                },
                {
                  key: "type",
                  header: "Type",
                  render: (row) => formatStatus(row.type),
                },
                {
                  key: "amount",
                  header: "Amount",
                  render: (row) => formatCurrency(row.amount),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => (
                    <StatusPill
                      label={formatStatus(row.status)}
                      variant={
                        row.status === "paid"
                          ? "approved"
                          : row.status === "overdue"
                            ? "review"
                            : "pending"
                      }
                    />
                  ),
                },
                {
                  key: "paid",
                  header: "Paid",
                  render: (row) => formatDate(row.paid_at),
                },
              ]}
            />
          </div>
        </Card>

        {canManageFinance(profile.role) && (
          <>
            <Card>
              <h2 className="font-display text-lg font-semibold">
                Add Expense
              </h2>
              <form
                action={createExpenseAction}
                className="mt-4 grid gap-4 sm:grid-cols-2"
              >
                <Field label="Category" name="category" required />
                <Field
                  label="Amount (USD)"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
                <Field
                  label="Incurred Date"
                  name="incurredAt"
                  type="date"
                  required
                />
                <div className="sm:col-span-2">
                  <TextArea label="Note" name="note" rows={2} />
                </div>
                <Button type="submit">Record expense</Button>
              </form>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold">Expenses</h2>
              <div className="mt-4">
                <DataTable
                  rows={expenses}
                  getRowKey={(row) => row.id}
                  emptyMessage="No expenses recorded."
                  columns={[
                    {
                      key: "category",
                      header: "Category",
                      render: (row) => row.category,
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      render: (row) => formatCurrency(row.amount),
                    },
                    {
                      key: "date",
                      header: "Date",
                      render: (row) => formatDate(row.incurred_at),
                    },
                    {
                      key: "note",
                      header: "Note",
                      render: (row) => row.note ?? "—",
                    },
                    {
                      key: "creator",
                      header: "Recorded By",
                      render: (row) =>
                        (row.creator as { name: string } | null)?.name ?? "—",
                    },
                    {
                      key: "actions",
                      header: "",
                      render: (row) => (
                        <form action={deleteExpenseAction}>
                          <input
                            type="hidden"
                            name="expenseId"
                            value={row.id}
                          />
                          <Button
                            type="submit"
                            className="!bg-accent-danger/20 !text-accent-danger text-xs"
                          >
                            Delete
                          </Button>
                        </form>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminShell>
  );
}
