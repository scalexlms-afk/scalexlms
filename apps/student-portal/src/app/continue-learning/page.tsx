import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { LessonRoadmap } from "@/components/continue-learning/lesson-roadmap";
import { MissionHero } from "@/components/continue-learning/mission-hero";
import { NextUnlockBanner } from "@/components/continue-learning/next-unlock-banner";
import { ProgressStrip } from "@/components/continue-learning/progress-strip";
import { SidePanels } from "@/components/continue-learning/side-panels";
import { WhyAndLearn } from "@/components/continue-learning/why-and-learn";
import { requireStudentProfile } from "@/lib/auth";
import { getContinueLearningData } from "@/lib/continue-learning";
import { isPremiumPlan } from "@scalex/db";

export default async function ContinueLearningPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);
  const data = await getContinueLearningData(userId, profile.name, premium);

  return (
    <PortalShell activePath="/continue-learning">
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <span className="mx-1.5 text-subtle">›</span>
              <span className="text-foreground">Continue Learning</span>
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">
              Continue Your Business
            </h1>
            <p className="mt-1 max-w-2xl text-muted">
              Every step you complete brings you closer to launching your Amazon
              brand.
            </p>
          </div>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 10v6M12 7.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            How it works
          </a>
        </div>

        <MissionHero
          title={data.missionTitle}
          body={data.missionBody}
          estimatedTimeLabel={data.estimatedTimeLabel}
          difficultyLabel={data.difficultyLabel}
          continueHref={data.continueHref}
        />

        <ProgressStrip
          stageTitle={data.currentStage}
          stepIndex={data.stepIndex}
          totalSteps={data.totalSteps}
          completionPercent={data.completionPercent}
          unlocksLabel={data.unlocksLabel}
        />

        <WhyAndLearn
          whyThisMatters={data.whyThisMatters}
          learnItems={data.learnItems}
          unlocksLabel={data.unlocksLabel}
        />

        <LessonRoadmap
          steps={data.roadmapSteps}
          stepsCompleted={data.stepsCompleted}
          stepsTotal={data.stepsTotal}
        />

        <SidePanels
          resources={data.resources}
          aiPrompts={data.aiPrompts}
          communityPosts={data.communityPosts}
        />

        <NextUnlockBanner
          nextMilestone={data.nextMilestone}
          unlocksLabel={data.unlocksLabel}
        />
      </div>
    </PortalShell>
  );
}
