import { RoadmapAccordion } from "@/components/roadmap/roadmap-accordion";
import { RoadmapFooter } from "@/components/roadmap/roadmap-footer";
import { RoadmapHero } from "@/components/roadmap/roadmap-hero";
import { RoadmapRail } from "@/components/roadmap/roadmap-rail";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { requireStudentProfile } from "@/lib/auth";
import { getRoadmapPageData } from "@/lib/roadmap";
import { isPremiumPlan } from "@scalex/db";

export default async function RoadmapPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);
  const data = await getRoadmapPageData(userId, profile.name, premium);

  if (!data) {
    return (
    <>
      <p className="text-muted">No published course found.</p>
    </>
    );
  }

  return (
    <>
      <div className="academy-page space-y-8">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Launch Roadmap" },
            ]}
          />
          <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
            Launch Roadmap
          </h1>
          <p className="mt-1 max-w-2xl text-muted">
            {data.courseDescription?.trim() ||
              "Follow the proven path from beginner to successful Amazon seller."}
          </p>
        </div>

        <RoadmapHero
          currentStage={data.currentStage}
          stepIndex={data.stepIndex}
          totalSteps={data.totalSteps}
          completionPercent={data.completionPercent}
          unlocksLabel={data.unlocksLabel}
          estimatedTimeLabel={data.estimatedTimeLabel}
          continueHref={data.continueHref}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <RoadmapAccordion
            milestones={data.milestones}
            defaultOpenId={data.currentMilestoneId}
            mentorHref={data.mentorHref}
            currentStage={data.currentStage}
          />
          <RoadmapRail
            unlocksLabel={data.unlocksLabel}
            unlockPreview={data.unlockPreview}
            aiPrompts={data.aiPrompts}
          />
        </div>

        <RoadmapFooter />
      </div>
    </>
  );
}
