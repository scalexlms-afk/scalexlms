import type { ReactNode } from "react";
import { Card } from "./card";

export type PipelineColumn<T> = {
  id: string;
  title: string;
  items: T[];
};

type PipelineBoardProps<T> = {
  columns: PipelineColumn<T>[];
  renderCard: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
};

export function PipelineBoard<T>({
  columns,
  renderCard,
  getItemKey,
}: PipelineBoardProps<T>) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {columns.map((column) => (
        <Card key={column.id} className="min-h-[280px]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {column.title}
            </h3>
            <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-muted">
              {column.items.length}
            </span>
          </div>
          <div className="space-y-2">
            {column.items.length === 0 ? (
              <p className="text-xs text-subtle">No leads</p>
            ) : (
              column.items.map((item) => (
                <div
                  key={getItemKey(item)}
                  className="rounded-lg border border-line bg-surface-3 p-3"
                >
                  {renderCard(item)}
                </div>
              ))
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
