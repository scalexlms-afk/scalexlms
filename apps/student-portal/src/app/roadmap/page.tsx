import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import {
  getPublishedCourse,
  getCourseWithRoadmap,
  getCompletedLessonIds,
  getTaskByMilestoneId,
  isMilestoneUnlocked,
} from "@/lib/data";
import { Card, JourneyStrip, ProgressBar, StatusPill } from "@scalex/ui";
import type { JourneyStep } from "@scalex/ui";
import Link from "next/link";

export default async function RoadmapPage() {
  const { userId } = await requireStudentProfile();
  const course = await getPublishedCourse();

  if (!course) {
    return (
      <PortalShell activePath="/roadmap">
        <p className="text-text-secondary-dark">No published course found.</p>
      </PortalShell>
    );
  }

  const roadmap = await getCourseWithRoadmap(course.id);
  const completedIds = await getCompletedLessonIds(userId);

  const unlockStates = await Promise.all(
    roadmap.map(async (ms) => ({
      id: ms.id,
      unlocked: await isMilestoneUnlocked(userId, ms.id),
      task: await getTaskByMilestoneId(ms.id),
    }))
  );
  const unlockByMilestone = new Map(
    unlockStates.map((state) => [state.id, state])
  );

  const steps: JourneyStep[] = roadmap.map((ms) => {
    const msLessons = ms.modules.flatMap((m) => m.lessons);
    const allDone =
      msLessons.length > 0 &&
      msLessons.every((l) => completedIds.has(l.id));
    const someDone = msLessons.some((l) => completedIds.has(l.id));

    let status: JourneyStep["status"] = "upcoming";
    if (allDone) status = "completed";
    else if (someDone) status = "current";
    else {
      const prevIndex = ms.order_index - 1;
      const prev = roadmap.find((r) => r.order_index === prevIndex);
      if (!prev || prev.modules.flatMap((m) => m.lessons).every((l) => completedIds.has(l.id))) {
        status = "current";
      }
    }

    return {
      id: ms.id,
      number: ms.order_index,
      title: ms.title,
      description: `${ms.modules.length} module${ms.modules.length !== 1 ? "s" : ""}`,
      color: ms.color ?? "text-scalex-red",
      status,
    };
  });

  return (
    <PortalShell activePath="/roadmap">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-dark">
            Learning Roadmap
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            {course.title}
          </h1>
          <p className="mt-1 max-w-2xl text-text-secondary-dark">
            {course.description}
          </p>
        </div>

        <Card>
          <h2 className="mb-6 font-display text-lg font-semibold">
            Your Journey
          </h2>
          <JourneyStrip steps={steps} />
        </Card>

        <div className="space-y-6">
          {roadmap.map((ms) => {
            const msLessons = ms.modules.flatMap((m) => m.lessons);
            const doneCount = msLessons.filter((l) =>
              completedIds.has(l.id)
            ).length;
            const total = msLessons.length;
            const pct = total > 0 ? (doneCount / total) * 100 : 0;
            const allDone = total > 0 && doneCount === total;
            const started = doneCount > 0;
            const milestoneState = unlockByMilestone.get(ms.id);
            const unlocked = milestoneState?.unlocked ?? false;
            const task = milestoneState?.task;

            return (
              <Card key={ms.id}>
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      allDone
                        ? "bg-accent-green/15 text-accent-green"
                        : started
                          ? "bg-scalex-red/15 text-scalex-red"
                          : "bg-white/[0.06] text-text-secondary-dark"
                    }`}
                  >
                    {allDone ? "✓" : ms.order_index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold">
                        {ms.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {!unlocked && (
                          <StatusPill label="Locked" variant="inactive" />
                        )}
                        <StatusPill
                          label={
                            allDone
                              ? "Completed"
                              : started
                                ? "In Progress"
                                : "Not Started"
                          }
                          variant={
                            allDone
                              ? "approved"
                              : started
                                ? "pending"
                                : "not_started"
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        value={pct}
                        showPercent={false}
                        label={`${doneCount} of ${total} lessons`}
                      />
                    </div>
                    {task && (
                      <div className="mt-3">
                        {unlocked ? (
                          <Link
                            href={`/tasks/${ms.id}`}
                            className="text-sm font-medium text-scalex-red hover:underline"
                          >
                            Milestone task: {task.title} →
                          </Link>
                        ) : (
                          <p className="text-sm text-text-tertiary-dark">
                            Milestone task: {task.title} (locked)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-4 border-t border-white/[0.06] pt-5">
                  {ms.modules.map((mod) => (
                    <div key={mod.id}>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary-dark">
                        {mod.title}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {mod.lessons.map((lesson) => {
                          const done = completedIds.has(lesson.id);
                          return (
                            <li key={lesson.id}>
                              <Link
                                href={`/lessons/${lesson.id}`}
                                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-scalex-charcoal-alt"
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                                    done
                                      ? "bg-accent-green/15 text-accent-green"
                                      : "bg-white/10 text-text-secondary-dark"
                                  }`}
                                >
                                  {done ? "✓" : lesson.order_index}
                                </span>
                                <span
                                  className={`flex-1 ${
                                    done
                                      ? "text-text-secondary-dark line-through"
                                      : "text-text-primary-dark"
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                                <span className="text-text-tertiary-dark opacity-0 transition-opacity group-hover:opacity-100">
                                  →
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PortalShell>
  );
}
