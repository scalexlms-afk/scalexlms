import { requireStudentProfile } from "@/lib/auth";
import { getNotificationsPageData } from "@/lib/notifications";
import { NotificationsWorkspace } from "@/components/notifications/notifications-workspace";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(portal)/notifications/actions";
import { toggleNotificationPreferenceAction } from "@/app/(portal)/settings/actions";

export default async function NotificationsPage() {
  const { userId } = await requireStudentProfile();
  const data = await getNotificationsPageData(userId);

  return (
    <div className="academy-page">
      <NotificationsWorkspace
        data={data}
        markReadAction={markNotificationRead}
        markAllAction={markAllNotificationsRead}
        togglePreferenceAction={toggleNotificationPreferenceAction}
      />
    </div>
  );
}
