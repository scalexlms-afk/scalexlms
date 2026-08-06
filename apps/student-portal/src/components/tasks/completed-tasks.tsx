import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Card, StatusPill } from "@scalex/ui";
import type { HubTaskItem } from "@/lib/tasks-hub";

function formatDate(value: string | null) {
  if (!value) return "Approved";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CompletedTasks({ items }: { items: HubTaskItem[] }) {
  if (items.length === 0) {
    return (
      <Card>
        <h2 className="font-display text-lg font-semibold">Completed Tasks</h2>
        <p className="mt-2 text-sm text-muted">
          Approved milestone tasks will show up here.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">Completed Tasks</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.slice(0, 8).map((item) => (
          <Card key={item.task.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green/15 text-accent-green">
                <CheckCircle weight="duotone" className="h-4 w-4" aria-hidden />
              </span>
              <StatusPill label="Approved" variant="approved" />
            </div>
            <p className="mt-3 font-semibold text-foreground">
              {item.task.title}
            </p>
            <p className="mt-1 text-xs text-muted">{item.milestoneTitle}</p>
            <p className="mt-2 text-xs text-subtle">
              {formatDate(item.reviewedAt ?? item.submittedAt)}
            </p>
            <Link
              href={`/tasks/${item.task.id}`}
              className="mt-3 inline-flex text-sm font-semibold text-scalex-red hover:underline"
            >
              View Submission
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
