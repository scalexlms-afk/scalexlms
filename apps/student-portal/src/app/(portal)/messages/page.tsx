import { requireStudentProfile } from "@/lib/auth";
import { getMessagesPageData } from "@/lib/messages";
import { isPremiumPlan } from "@scalex/db";
import { MessagesNoMentor } from "@/components/messages/messages-no-mentor";
import { MessagesUpgrade } from "@/components/messages/messages-upgrade";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import {
  markMentorMessagesReadAction,
  sendMentorMessageAction,
} from "./actions";

export default async function MessagesPage() {
  const { userId, profile } = await requireStudentProfile();
  const premium = isPremiumPlan(profile.plan);

  if (!premium) {
    return (
      <div className="academy-page h-full min-h-0 overflow-y-auto">
        <MessagesUpgrade plan={profile.plan} />
      </div>
    );
  }

  if (!profile.mentor_id) {
    return (
      <div className="academy-page h-full min-h-0 overflow-y-auto">
        <MessagesNoMentor />
      </div>
    );
  }

  const data = await getMessagesPageData(userId, profile);
  if (!data) {
    return (
      <div className="academy-page h-full min-h-0 overflow-y-auto">
        <MessagesNoMentor />
      </div>
    );
  }

  return (
    <div className="academy-page flex h-full min-h-0 flex-col">
      <MessagesWorkspace
        data={data}
        sendAction={sendMentorMessageAction}
        markReadAction={markMentorMessagesReadAction}
      />
    </div>
  );
}
