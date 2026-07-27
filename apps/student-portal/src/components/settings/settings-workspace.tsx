"use client";

import { useState } from "react";
import { Card } from "@scalex/ui";
import { SettingsHero } from "@/components/settings/settings-hero";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { SettingsProfileForm } from "@/components/settings/settings-profile-form";
import { SettingsLearningOverview } from "@/components/settings/settings-learning-overview";
import { SettingsHelp } from "@/components/settings/settings-help";
import { SettingsRail } from "@/components/settings/settings-rail";
import type {
  SettingsPageData,
  SettingsTabId,
} from "@/lib/settings-shared";

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-foreground">
        {title}
      </p>
      <p className="mt-2 max-w-md text-sm text-muted">
        This section is coming soon. Profile details and billing are available
        today.
      </p>
      <span className="mt-4 rounded-full bg-surface-3 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle">
        Coming soon
      </span>
    </Card>
  );
}

export function SettingsWorkspace({
  data,
  updateAction,
  flash,
}: {
  data: SettingsPageData;
  updateAction: (formData: FormData) => Promise<void>;
  flash: { saved?: boolean; error?: string | null };
}) {
  const [tab, setTab] = useState<SettingsTabId>("profile");

  return (
    <div className="settings-theme space-y-6">
      <SettingsHero />

      {flash.error ? (
        <div className="rounded-2xl border border-scalex-red/40 bg-scalex-red/5 px-4 py-3">
          <p className="text-sm text-scalex-red">{flash.error}</p>
        </div>
      ) : null}
      {flash.saved ? (
        <div className="rounded-2xl border border-accent-green/40 bg-accent-green/5 px-4 py-3">
          <p className="text-sm text-accent-green">Profile saved successfully.</p>
        </div>
      ) : null}

      <SettingsTabs active={tab} onChange={setTab} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {tab === "profile" ? (
            <>
              <SettingsProfileForm
                profile={data.profile}
                updateAction={updateAction}
              />
              <SettingsLearningOverview
                percent={data.profileCompletionPercent}
                checklist={data.checklist}
                stats={data.stats}
              />
              <SettingsHelp />
            </>
          ) : null}

          {tab === "learning" ? (
            <ComingSoonPanel title="Learning Preferences" />
          ) : null}
          {tab === "notifications" ? (
            <ComingSoonPanel title="Notification Settings" />
          ) : null}
          {tab === "security" ? (
            <ComingSoonPanel title="Security Settings" />
          ) : null}
          {tab === "subscription" ? (
            <ComingSoonPanel title="Subscription Settings" />
          ) : null}
          {tab === "account" ? (
            <ComingSoonPanel title="Account Controls" />
          ) : null}
        </div>

        <SettingsRail plan={data.plan} />
      </div>
    </div>
  );
}
