import type { ReactNode } from "react";
import { Card } from "./card";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon?: ReactNode;
  iconColor?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaPositive = true,
  icon,
  iconColor = "bg-accent-blue/15 text-accent-blue",
}: KpiCardProps) {
  return (
    <Card interactive>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary-dark">
            {label}
          </p>
          <p className="font-display text-3xl font-bold text-text-primary-dark">
            {value}
          </p>
          {delta && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                deltaPositive
                  ? "bg-accent-green/15 text-accent-green"
                  : "bg-accent-danger/15 text-accent-danger"
              }`}
            >
              <span aria-hidden="true">{deltaPositive ? "▲" : "▼"}</span>
              {delta}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColor}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
