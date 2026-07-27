import { requireStudentProfile } from "@/lib/auth";
import { getSettingsPageData } from "@/lib/settings";
import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { updateStudentProfileAction } from "./actions";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { userId, profile } = await requireStudentProfile();
  const params = await searchParams;
  const data = await getSettingsPageData(userId, profile);

  return (
    <div className="academy-page">
      <SettingsWorkspace
        data={data}
        updateAction={updateStudentProfileAction}
        flash={{
          saved: params.saved === "1",
          error: params.error ?? null,
        }}
      />
    </div>
  );
}
