import { AiMentorWorkspace } from "@/components/ai-mentor/ai-mentor-workspace";
import { requireStudentProfile } from "@/lib/auth";
import {
  getAiMentorContext,
  getRecentAiChats,
} from "@/lib/ai-mentor";

export default async function AiMentorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireStudentProfile();
  const params = await searchParams;
  const initialPrompt =
    typeof params.q === "string" ? params.q.trim().slice(0, 500) : "";

  const [context, chats] = await Promise.all([
    getAiMentorContext(session.userId),
    getRecentAiChats(session.userId),
  ]);

  return (
    <div className="academy-page">
      <AiMentorWorkspace
        context={context}
        initialPrompt={initialPrompt}
        initialChats={chats}
      />
    </div>
  );
}
