import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import {
  getPublishedCourse,
  getCourseWithRoadmap,
  ensureEnrollment,
  getCompletedLessonIds,
  getAnnouncements,
  getTaskByMilestoneId,
  getSubmissionForTask,
  getUpcomingSessions,
  getStudentBadges,
} from "@/lib/data";
import { BADGE_LABELS, LEVEL_LABELS, submissionStatusLabel, submissionStatusVariant } from "@scalex/db";
import { Card, KpiCard, ProgressBar, StatusPill, BadgeMedallion } from "@scalex/ui";
import Link from "next/link";

const iconClass = "h-5 w-5";

function formatSessionTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const { userId, profile } = await requireStudentProfile();
  const course = await getPublishedCourse();

  let completionPercent = 0;
  let currentStage = "Foundation";
  let totalLessons = 0;
  let completedCount = 0;
  let currentMilestoneId: string | null = null;
  let currentTask: Awaited<ReturnType<typeof getTaskByMilestoneId>> = null;
  let currentSubmission: Awaited<ReturnType<typeof getSubmissionForTask>> = null;

  if (course) {
    const enrollment = await ensureEnrollment(userId, course.id);
    completionPercent = enrollment.completion_percent;
    const roadmap = await getCourseWithRoadmap(course.id);
    const completedIds = await getCompletedLessonIds(userId);

    for (const ms of roadmap) {
      for (const mod of ms.modules) {
        totalLessons += mod.lessons.length;
        for (const lesson of mod.lessons) {
          if (completedIds.has(lesson.id)) completedCount++;
        }
      }
    }

    const currentMilestone = roadmap.find((ms) => {
      const msLessons = ms.modules.flatMap((m) => m.lessons);
      return msLessons.some((l) => !completedIds.has(l.id));
    }) ?? roadmap[roadmap.length - 1];

    if (currentMilestone) {
      currentStage = currentMilestone.title;
      currentMilestoneId = currentMilestone.id;
      currentTask = await getTaskByMilestoneId(currentMilestone.id);
      if (currentTask) {
        currentSubmission = await getSubmissionForTask(currentTask.id, userId);
      }
    }
  }

  const [announcements, upcomingSessions, badges] = await Promise.all([
    getAnnouncements(3),
    getUpcomingSessions(userId, 2),
    getStudentBadges(userId),
  ]);

  const earnedBadgeKeys = new Set(badges.map((badge) => badge.key));
  const displayBadges = Object.entries(BADGE_LABELS).slice(0, 6);

  return (
    <PortalShell activePath="/dashboard">
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Welcome back, {profile.name}
          </h1>
          <p className="mt-1 text-muted">
            Keep building momentum on your Amazon journey.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="Overall Completion"
            value={`${Math.round(completionPercent)}%`}
            iconColor="bg-scalex-red/15 text-scalex-red"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                <path
                  d="M12 2a10 10 0 1 0 10 10h-10V2Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
            }
          />
          <KpiCard
            label="Lessons Completed"
            value={`${completedCount}/${totalLessons}`}
            iconColor="bg-accent-green/15 text-accent-green"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <KpiCard
            label="Current Stage"
            value={currentStage}
            iconColor="bg-accent-purple/15 text-accent-purple"
            icon={
              <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
                <path
                  d="M6 3h12l-2 7 2 11H6l2-11L6 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Amazon Journey Progress
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Current stage:{" "}
                  <span className="text-foreground">{currentStage}</span>
                </p>
              </div>
              <Link
                href="/roadmap"
                className="shrink-0 text-sm font-medium text-scalex-red hover:underline"
              >
                View roadmap →
              </Link>
            </div>
            <div className="mt-5">
              <ProgressBar
                value={completionPercent}
                label="Overall completion"
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              {completedCount} of {totalLessons} lessons completed
            </p>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold">
              Today&apos;s Task
            </h2>
            {currentTask && currentMilestoneId ? (
              <>
                <p className="mt-2 text-sm text-foreground">
                  {currentTask.title}
                </p>
                <div className="mt-3">
                  <StatusPill
                    label={submissionStatusLabel(
                      currentSubmission?.status ?? "not_started"
                    )}
                    variant={submissionStatusVariant(
                      currentSubmission?.status ?? "not_started"
                    )}
                  />
                </div>
                <Link
                  href={`/tasks/${currentMilestoneId}`}
                  className="mt-4 inline-block text-sm font-medium text-scalex-red hover:underline"
                >
                  Open milestone task →
                </Link>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No milestone task available yet.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold">Upcoming Class</h2>
            {upcomingSessions.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                No upcoming sessions scheduled.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id}>
                    <p className="text-sm font-medium text-foreground">
                      {session.title}
                    </p>
                    <p className="text-xs text-subtle">
                      {formatSessionTime(session.scheduled_at)}
                    </p>
                  </div>
                ))}
                <Link
                  href="/sessions"
                  className="inline-block text-sm font-medium text-scalex-red hover:underline"
                >
                  View all sessions →
                </Link>
              </div>
            )}
          </Card>

          <Card className="md:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Achievements
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Level:{" "}
                  <span className="text-foreground">
                    {profile.level
                      ? LEVEL_LABELS[profile.level] ?? profile.level
                      : "Beginner Seller"}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-6">
              {displayBadges.map(([key, label]) => (
                <BadgeMedallion
                  key={key}
                  label={label}
                  earned={earnedBadgeKeys.has(key)}
                />
              ))}
            </div>
          </Card>

          <Card className="xl:col-span-1">
            <h2 className="font-display text-lg font-semibold">Announcements</h2>
            <div className="mt-4 space-y-3">
              {announcements.length === 0 ? (
                <p className="text-sm text-muted">
                  No announcements yet.
                </p>
              ) : (
                announcements.map((a) => (
                  <div
                    key={a.id}
                    className="border-b border-line pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {a.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </PortalShell>
  );
}
