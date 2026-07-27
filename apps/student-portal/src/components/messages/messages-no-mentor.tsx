import Link from "next/link";
import { ChatCircle, Lifebuoy } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { MessagesHero } from "@/components/messages/messages-hero";

export function MessagesNoMentor() {
  return (
    <div className="messages-theme space-y-6">
      <MessagesHero />
      <Card className="border-accent-purple/20">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
            <ChatCircle weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">
              No mentor assigned yet
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Once a mentor is assigned to your Premium Launch Program, private
              chat will appear here. Until then, reach out via Support or Ask AI.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/support"
                className="inline-flex items-center gap-2 rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-purple/90"
              >
                <Lifebuoy weight="bold" className="h-4 w-4" aria-hidden />
                Open a support ticket
              </Link>
              <Link
                href="/ai-mentor"
                className="inline-flex items-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-4 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
              >
                Ask AI Mentor
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
