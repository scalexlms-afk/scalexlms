import { requireStudentProfile } from "@/lib/auth";
import { getSessionsPageData } from "@/lib/sessions";
import { isPremiumPlan } from "@scalex/db";
import { SessionsUpgrade } from "@/components/sessions/sessions-upgrade";
import { SessionsWorkspace } from "@/components/sessions/sessions-workspace";

export default async function SessionsPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);

  if (!premium) {
    return (
      <div className="academy-page">
        <SessionsUpgrade plan={profile.plan} />
      </div>
    );
  }

  const data = await getSessionsPageData(
    userId,
    `${profile.email} · ${profile.name}`
  );

  return (
    <div className="academy-page">
      <SessionsWorkspace data={data} />
    </div>
  );
}
