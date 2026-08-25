import Link from "next/link";
import { Megaphone } from "@phosphor-icons/react/dist/ssr";
import type { Announcement } from "@scalex/db/types";
import { PLAN_FEATURES } from "@scalex/db";
import { Card } from "@scalex/ui";
import { AcademyCtaLink } from "@/components/academy-cta";
import type { LiveSession } from "@/lib/data";
import { SessionWhen } from "@/components/session-when";

function formatAnnounceDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function LiveAndAnnouncements({
  premium,
  sessions,
  announcements,
}: {
  premium: boolean;
  sessions: (LiveSession & { registered: boolean })[];
  announcements: Announcement[];
}) {
  const next = sessions[0] ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Upcoming Live Class
          </h2>
          <Link
            href={premium ? "/sessions" : "/payment?mode=upgrade"}
            className="text-sm font-medium text-scalex-red hover:underline"
          >
            View all
          </Link>
        </div>

        {premium ? (
          next ? (
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full bg-scalex-red/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-scalex-red">
                Live
              </span>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  {next.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  <SessionWhen value={next.scheduled_at} />
                </p>
                {next.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {next.description}
                  </p>
                )}
              </div>
              <AcademyCtaLink
                href={next.meeting_url || "/sessions"}
                className="!px-4 !py-2.5"
              >
                Join Class →
              </AcademyCtaLink>
            </div>
          ) : (
            <p className="text-sm text-muted">
              No upcoming sessions scheduled. Check back soon.
            </p>
          )
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Live classes and mentor workshops are part of the Premium Launch
              Program.
            </p>
            <ul className="space-y-1 text-xs text-subtle">
              {PLAN_FEATURES.premium.slice(1).map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Link
              href="/payment?mode=upgrade"
              className="inline-flex text-sm font-semibold text-scalex-red hover:underline"
            >
              Upgrade to Premium →
            </Link>
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Announcements</h2>
        </div>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a, index) => (
              <li
                key={a.id}
                className="border-b border-line pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl metallic-edge ${
                      index % 2 === 0
                        ? "bg-accent-purple/15 text-accent-purple"
                        : "bg-accent-green/15 text-accent-green"
                    }`}
                  >
                    <Megaphone weight="duotone" className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {a.title}
                      </p>
                      <span className="text-xs text-subtle">
                        {formatAnnounceDate(a.published_at)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {a.content}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
