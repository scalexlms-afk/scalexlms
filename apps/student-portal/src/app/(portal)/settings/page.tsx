import { requireStudentProfile } from "@/lib/auth";
import { getSettingsPageData } from "@/lib/settings";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import {
  changePasswordAction,
  deactivateAccountAction,
  updateLearningSettingsAction,
  updateNotificationPreferencesAction,
  updateStudentProfileAction,
  uploadAvatarAction,
} from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; tab?: string }>;
}) {
  const { userId, profile } = await requireStudentProfile();
  const params = await searchParams;
  const data = await getSettingsPageData(userId, profile);

  return (
    <div className="academy-page">
      <SettingsWorkspace
        data={data}
        initialTab={params.tab ?? null}
        updateAction={updateStudentProfileAction}
        uploadAvatarAction={uploadAvatarAction}
        updateNotificationPreferencesAction={
          updateNotificationPreferencesAction
        }
        updateLearningSettingsAction={updateLearningSettingsAction}
        changePasswordAction={changePasswordAction}
        deactivateAccountAction={deactivateAccountAction}
        flash={{
          saved: params.saved === "1",
          error: params.error ?? null,
        }}
      />
    </div>
  );
}
