import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import { getStudentJourneySummary } from "@/lib/data";
import { Card } from "@scalex/ui";

export default async function TasksIndexPage() {
  const { userId } = await requireStudentProfile();
  const journey = await getStudentJourneySummary(userId);
  const taskHref = journey.currentMilestoneId
    ? `/tasks/${journey.currentMilestoneId}`
    : journey.continueHref;

  return (
    <PortalShell activePath="/tasks">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Tasks
          </h1>
          <p className="mt-1 text-muted">
            Submit milestone deliverables and track mentor review status.
          </p>
        </div>

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Current stage
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {journey.currentStage}
            </p>
          </div>
          <p className="text-sm text-muted">
            Open your current milestone task to upload work, or continue from
            where you left off.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={taskHref}
              className="inline-flex items-center rounded-lg bg-scalex-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-scalex-red-dark"
            >
              Open current task
            </Link>
            <Link
              href="/roadmap"
              className="inline-flex items-center rounded-lg border border-line px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-3"
            >
              View roadmap
            </Link>
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
