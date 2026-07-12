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
      <p className="rounded-xl border border-line bg-surface-3 px-4 py-8 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="min-w-full divide-y divide-line text-sm">
        <thead className="sticky top-0 z-10 bg-surface-3 backdrop-blur metallic-edge">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="bg-surface/40 transition-colors hover:bg-surface-3"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 text-foreground ${column.className ?? ""}`}
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
