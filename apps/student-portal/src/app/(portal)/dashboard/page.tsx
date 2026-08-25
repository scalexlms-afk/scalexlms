import Link from "next/link";
import { AchievementsRow } from "@/components/dashboard/achievements-row";
import { HelpLinks } from "@/components/dashboard/help-links";
import { HowThisWorks } from "@/components/dashboard/how-this-works";
import { JourneyProgress } from "@/components/dashboard/journey-progress";
import { LiveAndAnnouncements } from "@/components/dashboard/live-and-announcements";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";
import { StageHero } from "@/components/dashboard/stage-hero";
import { TodaysMission } from "@/components/dashboard/todays-mission";
import { requireStudentProfile } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { getStudentPlatformPrefs } from "@/lib/platform-prefs";
import { isPremiumPlan, planLabel } from "@scalex/db";
import { Card } from "@scalex/ui";

export default async function DashboardPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);
  const [data, platformPrefs] = await Promise.all([
    getDashboardData(userId, profile.name, premium),
    getStudentPlatformPrefs(),
  ]);

  return (
    <>
      <div className="academy-page space-y-8">
        <div>
          <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
            Welcome back, {data.firstName}!
          </h1>
          <p className="mt-1 text-muted">
            Keep building momentum on your Amazon journey.
          </p>
        </div>

        <AchievementsRow
          badges={data.badges}
          level={profile.level}
          completionPercent={data.completionPercent}
        />

        {data.remainingPayment && (
          <Card className="border-accent-amber/40 bg-accent-amber/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Remaining balance due
                </h2>
                <p className="mt-1 text-sm text-muted">
                  ${(data.remainingPayment.amount / 100).toFixed(0)} remaining
                  on your {planLabel(profile.plan, true)} plan.
                </p>
              </div>
              <Link
                href="/payment?mode=remaining"
                className="rounded-lg bg-scalex-red px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Pay remaining balance
              </Link>
            </div>
          </Card>
        )}

        <StageHero
          stageTitle={data.currentStage}
          stepIndex={data.stepIndex}
          totalSteps={data.totalSteps}
          completionPercent={data.completionPercent}
          coverSrc={data.coverSrc}
        />

        <TodaysMission
          title={data.nextAction.title}
          description={data.nextAction.description}
          status={data.currentSubmission?.status ?? "not_started"}
          lessonsLeft={data.lessonsLeftInStage}
          unlocksLabel={data.unlocksLabel}
          continueHref={data.nextAction.href}
          kind={data.nextAction.kind}
        />

        <HowThisWorks introVideoUrl={platformPrefs.introVideoUrl} />

        <JourneyProgress
          milestones={data.milestones}
          nextMilestone={data.nextMilestone}
        />

        <RecentNotifications items={data.recentNotifications} />

        <HelpLinks premium={premium} />

        <LiveAndAnnouncements
          premium={premium}
          sessions={data.upcomingSessions}
          announcements={data.announcements}
        />
      </div>
    </>
  );
}
