import Link from "next/link";
import { ChatCircle } from "@phosphor-icons/react/dist/ssr";
import { PLAN_FEATURES, planLabel, planPillVariant } from "@scalex/db";
import { Card, StatusPill } from "@scalex/ui";

export function MessagesUpgrade({ plan }: { plan: string | null }) {
  return (
    <div className="messages-theme space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <ChatCircle weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Mentor Chat
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Private mentor messaging is included in Premium
            </p>
          </div>
        </div>
        <StatusPill label={planLabel(plan)} variant={planPillVariant(plan)} />
      </div>

      <Card className="border-accent-purple/25 bg-gradient-to-br from-accent-purple/10 via-surface-2 to-surface-2">
        <h2 className="font-display text-lg font-semibold">
          Upgrade to unlock Mentor Chat
        </h2>
        <p className="mt-2 text-sm text-muted">
          Your Standard plan includes recorded curriculum and AI Mentor. Private
          mentor messaging and live mentorship unlock with Premium.
        </p>
        <ul className="mt-4 space-y-2">
          {PLAN_FEATURES.premium.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-sm text-muted"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-purple" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/payment?mode=upgrade"
            className="inline-flex rounded-xl bg-accent-purple px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
          >
            Upgrade now
          </Link>
          <Link
            href="/ai-mentor"
            className="text-sm font-medium text-accent-purple hover:underline"
          >
            Chat with AI Mentor →
          </Link>
        </div>
      </Card>
    </div>
  );
}
