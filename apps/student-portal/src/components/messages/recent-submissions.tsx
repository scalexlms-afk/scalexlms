"use client";

import Link from "next/link";
import { StatusPill } from "@scalex/ui";
import {
  submissionStatusLabel,
  submissionStatusVariant,
  type RecentSubmissionItem,
} from "@/lib/messages-shared";

export function RecentSubmissions({
  submissions,
}: {
  submissions: RecentSubmissionItem[];
}) {
  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted">
        No recent submissions yet.{" "}
        <Link href="/tasks" className="font-medium text-accent-purple hover:underline">
          Open tasks
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {submissions.map((item) => (
        <li key={item.id}>
          <Link
            href={`/tasks`}
            className="flex items-start justify-between gap-2 rounded-xl border border-line bg-surface-3/40 px-3 py-2.5 transition hover:border-accent-purple/40 hover:bg-accent-purple/5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {item.taskTitle}
              </p>
              <p className="mt-0.5 text-[11px] text-subtle">
                {item.submittedAt
                  ? new Date(item.submittedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Updated recently"}
              </p>
            </div>
            <StatusPill
              label={submissionStatusLabel(item.status)}
              variant={submissionStatusVariant(item.status)}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
