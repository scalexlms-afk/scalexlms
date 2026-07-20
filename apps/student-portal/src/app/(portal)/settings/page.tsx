import Link from "next/link";
import { requireStudentProfile } from "@/lib/auth";
import { planLabel, planPillVariant } from "@scalex/db";
import { Card, StatusPill } from "@scalex/ui";

export default async function SettingsPage() {
  const { profile } = await requireStudentProfile();

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-muted">
            Your profile and plan overview. Full settings redesign coming soon.
          </p>
        </div>

        <Card className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Profile
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {profile.name}
            </p>
            <p className="text-sm text-muted">{profile.email}</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Plan
            </p>
            <StatusPill
              label={`${planLabel(profile.plan, true)} Plan`}
              variant={planPillVariant(profile.plan)}
            />
          </div>
          <Link
            href="/billing"
            className="inline-flex text-sm font-medium text-scalex-red hover:underline"
          >
            Manage billing →
          </Link>
        </Card>
      </div>
    </>
  );
}
