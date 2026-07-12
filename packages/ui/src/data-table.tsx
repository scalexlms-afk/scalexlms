"use client";

import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  getRowKey: (row: T) => string;
};

export function DataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
  getRowKey,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-scalex-charcoal-alt px-4 py-8 text-center text-sm text-text-secondary-dark">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
      <table className="min-w-full divide-y divide-white/[0.06] text-sm">
        <thead className="bg-scalex-charcoal-alt">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-dark ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="bg-scalex-black/40 transition-colors hover:bg-white/[0.02]"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-text-primary-dark ${column.className ?? ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
