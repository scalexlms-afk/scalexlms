import Link from "next/link";
import { VideoCamera } from "@phosphor-icons/react/dist/ssr";
import { PLAN_FEATURES, planLabel, planPillVariant } from "@scalex/db";
import { Card, StatusPill } from "@scalex/ui";

export function SessionsUpgrade({ plan }: { plan: string | null }) {
  return (
    <div className="sessions-theme space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-purple/20 text-accent-purple metallic-edge">
            <VideoCamera weight="duotone" className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Live Classes
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Premium live access for cohort classes and mentor Q&amp;As
            </p>
          </div>
        </div>
        <StatusPill
          label={planLabel(plan)}
          variant={planPillVariant(plan)}
        />
      </div>

      <Card className="border-accent-purple/25 bg-gradient-to-br from-accent-purple/10 via-surface-2 to-surface-2">
        <h2 className="font-display text-lg font-semibold">
          Upgrade to unlock Live Classes
        </h2>
        <p className="mt-2 text-sm text-muted">
          Your Standard plan includes recorded curriculum and AI Mentor. Live
          classes and mentor calls unlock with Premium.
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
            href="/dashboard"
            className="text-sm font-medium text-accent-purple hover:underline"
          >
            Back to dashboard →
          </Link>
        </div>
      </Card>
    </div>
  );
}
