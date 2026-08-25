import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { requireStudentProfile } from "@/lib/auth";
import {
  getCompletedLessonIds,
  getCourseWithRoadmap,
  getPublishedCourse,
  isMilestoneUnlocked,
} from "@/lib/data";
import { Card, StatusPill } from "@scalex/ui";

export default async function LessonsIndexPage() {
  const { userId } = await requireStudentProfile();
  const course = await getPublishedCourse();

  if (!course) {
    return (
      <div className="academy-page space-y-6">
        <h1 className="academy-page-heading font-display text-2xl font-bold">
          Lessons
        </h1>
        <p className="text-sm text-muted">No published course is available yet.</p>
      </div>
    );
  }

  const [roadmap, completedIds] = await Promise.all([
    getCourseWithRoadmap(course.id),
    getCompletedLessonIds(userId),
  ]);

  const ordered = [...roadmap].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );
  const unlockFlags = await Promise.all(
    ordered.map((ms) => isMilestoneUnlocked(userId, ms.id))
  );

  let lessonNumber = 0;
  const groups = ordered.map((ms, index) => {
    const lessons = [...ms.modules]
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .flatMap((mod) =>
        [...mod.lessons].sort(
          (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
        )
      );
    const unlocked = unlockFlags[index] ?? false;
    return {
      id: ms.id,
      title: ms.title,
      unlocked,
      lessons: lessons.map((lesson) => {
        lessonNumber += 1;
        return {
          id: lesson.id,
          number: lessonNumber,
          title: lesson.title,
          type: lesson.content_type,
          complete: completedIds.has(lesson.id),
          unlocked,
        };
      }),
    };
  });

  return (
    <div className="academy-page space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Lessons" },
          ]}
        />
        <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
          Lessons
        </h1>
        <p className="mt-1 text-muted">
          Published course lessons in order. Locked stages stay closed until the
          previous milestone is approved.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted">No lessons have been published yet.</p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-semibold">
                  {group.title}
                </h2>
                <StatusPill
                  label={group.unlocked ? "Open" : "Locked"}
                  variant={group.unlocked ? "approved" : "neutral"}
                />
              </div>
              {group.lessons.length === 0 ? (
                <p className="text-sm text-muted">No lessons in this stage.</p>
              ) : (
                <ul className="space-y-2">
                  {group.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      {lesson.unlocked ? (
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 text-sm transition hover:border-scalex-red/40"
                        >
                          <span className="min-w-0">
                            <span className="font-medium text-foreground">
                              Lesson {lesson.number}: {lesson.title}
                            </span>
                            <span className="mt-0.5 block text-xs capitalize text-subtle">
                              {lesson.type}
                            </span>
                          </span>
                          <StatusPill
                            label={lesson.complete ? "Done" : "Open"}
                            variant={lesson.complete ? "approved" : "pending"}
                          />
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line px-3 py-2.5 text-sm">
                          <span className="text-muted">
                            Lesson {lesson.number}: {lesson.title}
                          </span>
                          <StatusPill label="Locked" variant="neutral" />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
