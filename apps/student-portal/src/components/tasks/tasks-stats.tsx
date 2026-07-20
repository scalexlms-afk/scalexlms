import { Card } from "@scalex/ui";
import type { TasksHubStats } from "@/lib/tasks-hub";

export function TasksStats({ stats }: { stats: TasksHubStats }) {
  const items = [
    {
      label: "Pending",
      value: stats.pending,
      iconClass: "bg-accent-amber/15 text-accent-amber",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Under Review",
      value: stats.underReview,
      iconClass: "bg-accent-purple/15 text-accent-purple",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M8 6h8l1 4H7l1-4Zm-1 4 2 10h6l2-10" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Completed",
      value: stats.completed,
      iconClass: "bg-accent-green/15 text-accent-green",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.5 12 2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: "Total Tasks",
      value: stats.total,
      iconClass: "bg-accent-blue/15 text-accent-blue",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M8 5h11v14H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9.5 10 1.5 1.5L14 8.5M9.5 15.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="!p-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
            >
              {item.icon}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {item.label}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
