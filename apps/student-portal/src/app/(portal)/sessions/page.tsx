import { requireStudentProfile } from "@/lib/auth";
import { getSessionsPageData } from "@/lib/sessions";
import { isPremiumPlan } from "@scalex/db";
import { SessionsUpgrade } from "@/components/sessions/sessions-upgrade";
import { SessionsWorkspace } from "@/components/sessions/sessions-workspace";
import { ScreenRecordingNotice } from "@/components/screen-recording-notice";
import { getStudentPlatformPrefs } from "@/lib/platform-prefs";

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

  const [data, platformPrefs] = await Promise.all([
    getSessionsPageData(userId, `${profile.email} · ${profile.name}`),
    getStudentPlatformPrefs(),
  ]);

  return (
    <div className="academy-page space-y-4">
      {platformPrefs.detectScreenRecording ? <ScreenRecordingNotice /> : null}
      <SessionsWorkspace data={data} />
    </div>
  );
}
