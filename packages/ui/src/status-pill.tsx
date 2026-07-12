type StatusVariant =
  | "approved"
  | "active"
  | "pending"
  | "review"
  | "revision"
  | "overdue"
  | "inactive"
  | "not_started"
  | "neutral";

interface StatusPillProps {
  label: string;
  variant?: StatusVariant;
}

const variantClasses: Record<StatusVariant, string> = {
  approved: "bg-accent-green/15 text-accent-green",
  active: "bg-accent-green/15 text-accent-green",
  pending: "bg-accent-amber/15 text-accent-amber",
  review: "bg-accent-amber/15 text-accent-amber",
  revision: "bg-accent-danger/15 text-accent-danger",
  overdue: "bg-accent-danger/15 text-accent-danger",
  inactive: "bg-text-tertiary-dark/20 text-subtle",
  not_started: "bg-text-tertiary-dark/20 text-subtle",
  neutral: "bg-surface-3 text-muted",
};

const dotClasses: Record<StatusVariant, string> = {
  approved: "bg-accent-green",
  active: "bg-accent-green",
  pending: "bg-accent-amber",
  review: "bg-accent-amber",
  revision: "bg-accent-danger",
  overdue: "bg-accent-danger",
  inactive: "bg-text-tertiary-dark",
  not_started: "bg-text-tertiary-dark",
  neutral: "bg-text-secondary-dark",
};

export function StatusPill({ label, variant = "neutral" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`} />
      {label}
    </span>
  );
}
