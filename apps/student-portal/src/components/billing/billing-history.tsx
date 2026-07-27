"use client";

import { DownloadSimple, Receipt } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  formatBillingDate,
  formatBillingMoney,
  formatPaymentMethod,
  paymentStatusLabel,
  paymentStatusTone,
  type BillingHistoryItem,
} from "@/lib/billing-shared";

export function BillingHistory({ items }: { items: BillingHistoryItem[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Receipt weight="duotone" className="h-5 w-5 text-accent-purple" aria-hidden />
        <h2 className="font-display text-lg font-bold text-foreground">
          Payment History
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-surface-3/30 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">No payments yet</p>
          <p className="mt-1 text-xs text-muted">
            Invoices will show here after your first payment.
          </p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wider text-subtle">
                <th className="pb-2 pr-3 font-semibold">Invoice #</th>
                <th className="pb-2 pr-3 font-semibold">Date</th>
                <th className="pb-2 pr-3 font-semibold">Amount</th>
                <th className="pb-2 pr-3 font-semibold">Method</th>
                <th className="pb-2 pr-3 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tone = paymentStatusTone(item.status);
                return (
                  <tr key={item.id} className="border-b border-line/70 last:border-0">
                    <td className="py-3 pr-3 font-medium text-foreground">
                      {item.invoiceNumber ?? "—"}
                    </td>
                    <td className="py-3 pr-3 text-muted">
                      {formatBillingDate(item.date)}
                    </td>
                    <td className="py-3 pr-3 font-semibold text-foreground">
                      {formatBillingMoney(item.amountCents)}
                    </td>
                    <td className="py-3 pr-3 text-muted">
                      {formatPaymentMethod(item.method)}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          tone === "paid"
                            ? "bg-accent-green/15 text-accent-green"
                            : tone === "pending"
                              ? "bg-accent-amber/15 text-accent-amber"
                              : "bg-surface-3 text-muted"
                        }`}
                      >
                        {paymentStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-purple hover:underline"
                        >
                          <DownloadSimple weight="bold" className="h-4 w-4" aria-hidden />
                          Download
                        </a>
                      ) : (
                        <span
                          title="Invoice PDF not available"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-subtle/70"
                        >
                          <DownloadSimple weight="bold" className="h-4 w-4" aria-hidden />
                          Download
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
