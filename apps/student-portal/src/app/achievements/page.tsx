import { PortalShell } from "@/components/portal-shell";
import { requireStudentProfile } from "@/lib/auth";
import { getStudentBadges } from "@/lib/data";
import { BADGE_LABELS, LEVEL_LABELS } from "@scalex/db";
import { BadgeMedallion, Card } from "@scalex/ui";

export default async function AchievementsPage() {
  const { userId } = await requireStudentProfile();
  const badges = await getStudentBadges(userId);
  const earned = new Set(badges.map((b) => b.key));

  return (
    <PortalShell activePath="/achievements">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Academy
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Achievements
          </h1>
          <p className="mt-1 text-muted">
            Badges and levels earned as you complete your Amazon journey.
          </p>
        </div>

        <Card>
          <h2 className="font-display text-lg font-semibold">Levels</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {Object.values(LEVEL_LABELS).map((label) => (
              <li key={label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                {label}
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(BADGE_LABELS).map(([key, label]) => (
            <Card key={key} className="flex items-center gap-3">
              <BadgeMedallion earned={earned.has(key)} label={label} />
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted">
                  {earned.has(key) ? "Earned" : "Locked"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
