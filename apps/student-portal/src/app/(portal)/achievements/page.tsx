import { AchievementsFooterCta } from "@/components/achievements/achievements-footer-cta";
import { AchievementsHub } from "@/components/achievements/achievements-hub";
import { AchievementsStatsRow } from "@/components/achievements/achievements-stats";
import { NextAchievementBar } from "@/components/achievements/next-achievement-bar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { requireStudentProfile } from "@/lib/auth";
import { getAchievementsHubData } from "@/lib/achievements";
import { isPremiumPlan } from "@scalex/db";

export default async function AchievementsPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);
  const data = await getAchievementsHubData(
    userId,
    profile.name,
    premium,
    profile.level
  );

  return (
    <>
      <div className="academy-page space-y-8">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Achievements" },
            ]}
          />
          <h1 className="academy-page-heading font-display text-2xl font-bold md:text-3xl">
            Your Achievements
          </h1>
          <p className="mt-1 max-w-2xl text-muted">
            Celebrate your progress and unlock new milestones on your Amazon
            journey.
          </p>
        </div>

        <AchievementsStatsRow stats={data.stats} />
        <NextAchievementBar achievement={data.nextAchievement} />

        <AchievementsHub
          achievements={data.achievements}
          categories={data.categories}
          defaultSelectedId={data.defaultSelectedId}
          journeyMilestones={data.journeyMilestones}
        />

        <AchievementsFooterCta href={data.continueHref} />
      </div>
    </>
  );
}
