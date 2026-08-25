import Link from "next/link";
import { Lock, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Card, StatusPill } from "@scalex/ui";
import {
  submissionStatusLabel,
  submissionStatusVariant,
} from "@scalex/db";
import type { HubTaskItem } from "@/lib/tasks-hub";

function WatchHint({ item }: { item: HubTaskItem }) {
  if (!item.lessonNumber || !item.lessonHref) return null;
  return (
    <p className="mt-2 text-xs text-muted">
      Watch lesson {item.lessonNumber} to complete this task
      {" · "}
      <Link href={item.lessonHref} className="font-semibold text-scalex-red hover:underline">
        Open lesson
      </Link>
    </p>
  );
}

function TaskRow({
  item,
  state,
}: {
  item: HubTaskItem;
  state: "current" | "upcoming" | "done";
}) {
  const locked = state === "upcoming";
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{item.task.title}</p>
          <p className="mt-0.5 text-xs text-muted">{item.milestoneTitle}</p>
        </div>
        {state === "done" ? (
          <StatusPill label="DONE" variant="approved" />
        ) : locked ? (
          <StatusPill label="Locked" variant="neutral" />
        ) : (
          <StatusPill
            label={submissionStatusLabel(item.status)}
            variant={submissionStatusVariant(item.status)}
          />
        )}
      </div>
      {state !== "done" ? <WatchHint item={item} /> : null}
    </>
  );

  if (locked) {
    return (
      <div className="rounded-xl border border-dashed border-line px-3 py-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-subtle">
          <Lock className="h-3.5 w-3.5" aria-hidden />
          Upcoming
        </div>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/tasks/${item.task.id}`}
      className="block rounded-xl border border-line px-3 py-3 transition hover:border-scalex-red/40"
    >
      {state === "done" ? (
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-green">
          <CheckCircle className="h-3.5 w-3.5" aria-hidden />
          Completed
        </div>
      ) : null}
      {inner}
    </Link>
  );
}

export function TaskStageLists({
  currentStage,
  upcoming,
}: {
  currentStage: HubTaskItem[];
  upcoming: HubTaskItem[];
}) {
  if (currentStage.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="font-display text-lg font-semibold">Current stage</h2>
        <p className="mt-1 text-sm text-muted">
          Open tasks for the stage you are on.
        </p>
        {currentStage.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No open tasks in this stage.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {currentStage.map((item) => (
              <li key={item.task.id}>
                <TaskRow item={item} state="current" />
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="font-display text-lg font-semibold">Upcoming</h2>
        <p className="mt-1 text-sm text-muted">
          Locked until the current stage is approved.
        </p>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No upcoming tasks.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((item) => (
              <li key={item.task.id}>
                <TaskRow item={item} state="upcoming" />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
