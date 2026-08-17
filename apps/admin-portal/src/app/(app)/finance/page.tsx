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
import { canManageFinance } from "@/lib/admin-db";
import {
  getExpenses,
  getPaymentPlanSettings,
  getPayments,
  getRevenueSeries,
} from "@/lib/data";
import {
  formatCurrency,
  formatDate,
  formatStatus,
} from "@/lib/format";
import { planLabel, planPillVariant } from "@scalex/db";
import { createExpenseAction, deleteExpenseAction } from "./actions";
import { Button, DataTable, LineChartCard, StatusPill } from "@scalex/ui";
import Link from "next/link";

type FinanceTab = "payments" | "expenses" | "plans";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "finance");

  const params = await searchParams;
  const manage = canManageFinance(profile.role);
  const tab: FinanceTab =
    params.tab === "expenses" && manage
      ? "expenses"
      : params.tab === "plans" && manage
        ? "plans"
        : "payments";

  const [payments, expenses, planSettings, revenueSeries] = await Promise.all([
    getPayments({ userId, role: profile.role }),
    manage ? getExpenses() : Promise.resolve([]),
    manage ? getPaymentPlanSettings() : Promise.resolve([]),
    getRevenueSeries({ userId, role: profile.role }),
  ]);

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter((p) =>
    ["pending", "overdue"].includes(p.status)
  );
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const net = totalRevenue - totalExpenses;

  const kpiItems: {
    label: string;
    value: string;
    hint?: string;
    tone?: "default" | "danger" | "success";
  }[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      tone: "success",
      hint: "All paid volume",
    },
    {
      label: "Payment Risk",
      value: String(pendingPayments.length),
      tone: pendingPayments.length > 0 ? "danger" : "default",
      hint: "Pending or overdue",
    },
    {
      label: "Paid Payments",
      value: String(paidCount),
      hint: `${payments.length} total records`,
    },
  ];

  if (manage) {
    kpiItems.push(
      {
        label: "Total Expenses",
        value: formatCurrency(totalExpenses),
        hint: "Academy spend",
      },
      {
        label: "Net",
        value: formatCurrency(net),
        tone: net >= 0 ? "success" : "danger",
        hint: "Revenue − expenses",
      }
    );
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Business"
        title="Payments & Expenses"
        description="Revenue tracking, installments, and academy expenses."
        searchPlaceholder="Search payments..."
        primaryAction={
          manage ? { label: "+ Add Expense", href: "/finance?tab=expenses" } : undefined
        }
      />

      <AdminKpiGrid items={kpiItems} />

      <AdminPanel title="Revenue Trend">
        <LineChartCard title="" data={revenueSeries} valuePrefix="$" />
      </AdminPanel>

      <AdminFilterTabs
        active={tab}
        tabs={[
          {
            id: "payments",
            label: "Payments",
            count: payments.length,
            href: "/finance?tab=payments",
          },
          ...(manage
            ? [
                {
                  id: "expenses",
                  label: "Expenses",
                  count: expenses.length,
                  href: "/finance?tab=expenses",
                },
                {
                  id: "plans",
                  label: "Plans",
                  count: planSettings.length,
                  href: "/finance?tab=plans",
                },
              ]
            : []),
        ]}
      />

      <AdminSplit
        main={
          <div className="space-y-4">
            {tab === "payments" ? (
              <AdminPanel title="Payments">
                <DataTable
                  rows={payments}
                  getRowKey={(row) => row.id}
                  emptyMessage="No payments found."
                  columns={[
                    {
                      key: "student",
                      header: "Student",
                      render: (row) => (
                        <div>
                          <p>{row.student?.name ?? "—"}</p>
                          {row.student?.plan && (
                            <div className="mt-1">
                              <StatusPill
                                label={planLabel(row.student.plan, true)}
                                variant={planPillVariant(row.student.plan)}
                              />
                            </div>
                          )}
                        </div>
                      ),
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
              </AdminPanel>
            ) : null}

            {tab === "expenses" && manage ? (
              <>
                <AdminPanel title="Add Expense">
                  <form
                    action={createExpenseAction}
                    className="grid gap-4 sm:grid-cols-2"
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
                </AdminPanel>

                <AdminPanel title="Expenses">
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
                          (row.creator as { name: string } | null)?.name ??
                          "—",
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
                              variant="secondary"
                              className="!bg-accent-danger/20 !text-accent-danger text-xs"
                            >
                              Delete
                            </Button>
                          </form>
                        ),
                      },
                    ]}
                  />
                </AdminPanel>
              </>
            ) : null}

            {tab === "plans" && manage ? (
              <AdminPanel title="Plan pricing">
                <p className="mb-4 text-sm text-muted">
                  Edit installment splits in{" "}
                  <Link
                    href="/settings?section=general"
                    className="font-semibold text-scalex-red hover:underline"
                  >
                    Settings → General
                  </Link>
                  .
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {planSettings.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-line bg-surface-3 p-4"
                    >
                      <p className="font-display font-semibold">
                        {planLabel(
                          (p as { plan_type?: string }).plan_type,
                          true
                        )}
                      </p>
                      <p className="mt-2 text-2xl font-bold">
                        {formatCurrency(p.total_cents)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {p.first_payment_percent}% first /{" "}
                        {p.remaining_percent}% remaining
                      </p>
                    </div>
                  ))}
                </div>
              </AdminPanel>
            ) : null}
          </div>
        }
        rail={
          <AdminDetailRail title="Finance summary">
            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span className="text-muted">Paid revenue</span>
                <span className="font-semibold">
                  {formatCurrency(totalRevenue)}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted">At risk</span>
                <span className="font-semibold">{pendingPayments.length}</span>
              </p>
              {manage ? (
                <>
                  <p className="flex justify-between">
                    <span className="text-muted">Expenses</span>
                    <span className="font-semibold">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </p>
                  <p className="flex justify-between border-t border-line pt-3">
                    <span className="text-muted">Net</span>
                    <span className="font-semibold">{formatCurrency(net)}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs text-subtle">
                  Expense management is Super Admin only.
                </p>
              )}
              {pendingPayments.length > 0 ? (
                <div className="rounded-lg border border-line bg-surface-3 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Risk queue
                  </p>
                  <ul className="mt-2 space-y-1 text-xs">
                    {pendingPayments.slice(0, 5).map((p) => (
                      <li key={p.id} className="flex justify-between gap-2">
                        <span className="truncate">
                          {p.student?.name ?? "Student"}
                        </span>
                        <span>{formatCurrency(p.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </AdminDetailRail>
        }
      />
    </>
  );
}
