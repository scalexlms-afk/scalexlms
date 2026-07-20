import { PortalShell } from "@/components/portal-shell";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { requireStudentProfile } from "@/lib/auth";

export default async function AiMentorPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStudentProfile();
  const params = await searchParams;
  const initialPrompt =
    typeof params.q === "string" ? params.q.trim().slice(0, 500) : "";

  return (
    <PortalShell activePath="/ai-mentor">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            AI Mentor
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Your LaunchPad assistant
          </h1>
          <p className="mt-1 text-muted">
            Grounded in academy lessons to help you move faster on your Amazon
            journey.
          </p>
        </div>

        <AiChatPanel initialPrompt={initialPrompt} />
      </div>
    </PortalShell>
  );
}
