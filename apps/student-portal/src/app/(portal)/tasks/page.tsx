import Link from "next/link";
import { CompletedTasks } from "@/components/tasks/completed-tasks";
import { CurrentTaskHero } from "@/components/tasks/current-task-hero";
import { ImplementationChecklist } from "@/components/tasks/implementation-checklist";
import { ReviewTimeline } from "@/components/tasks/review-timeline";
import { TaskOverview } from "@/components/tasks/task-overview";
import { TaskSubmitForm } from "@/components/tasks/task-submit-form";
import { TasksStats } from "@/components/tasks/tasks-stats";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { requireStudentProfile } from "@/lib/auth";
import { getTasksHubData } from "@/lib/tasks-hub";
import { isPremiumPlan } from "@scalex/db";

export default async function TasksHubPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);
  const hub = await getTasksHubData(userId, profile.name, premium);
  const current = hub.current;

  return (
    <>
      <div className="academy-page space-y-8">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Tasks" },
            ]}
          />
          <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
            Your Implementation Tasks
          </h1>
          <p className="mt-1 text-muted">
            Submit milestone deliverables for mentor review. AI assists —
            mentors approve.
          </p>
        </div>

        <TasksStats stats={hub.stats} />

        {current ? (
          <>
            <CurrentTaskHero
              title={current.task.title}
              milestoneTitle={current.milestoneTitle}
              description={current.objective}
              estimatedTimeLabel={current.estimatedTimeLabel}
              formatsLabel={current.formatsLabel}
              unlockReward={current.unlockReward}
              lessonHref={current.lessonHref}
              canSubmit={current.canSubmit}
            />

            <TaskOverview
              objective={current.objective}
              whyThisMatters={current.whyThisMatters}
              requirements={current.requirements}
              aiPrompts={current.aiPrompts}
            />

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <ImplementationChecklist steps={current.implementationSteps} />
                <ReviewTimeline stages={current.timeline} />
              </div>
              <TaskSubmitForm
                taskId={current.task.id}
                acceptedFormats={current.task.accepted_formats}
                canSubmit={current.canSubmit}
                lockedMessage={
                  !current.unlocked
                    ? "This milestone is locked. Complete the previous task to unlock it."
                    : current.status === "approved"
                      ? "This task is approved. Open the detail page for full history."
                      : "Your submission is under review. Check the review status timeline."
                }
              />
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface-2 px-6 py-12 text-center metallic-edge">
            <p className="font-display text-lg font-semibold text-foreground">
              No tasks yet
            </p>
            <p className="mt-1 text-sm text-muted">
              Tasks appear when your course milestones have deliverables
              configured.
            </p>
            <Link
              href="/roadmap"
              className="mt-4 inline-flex text-sm font-semibold text-scalex-red hover:underline"
            >
              Open launch roadmap →
            </Link>
          </div>
        )}

        <CompletedTasks items={hub.completed} />
      </div>
    </>
  );
}
