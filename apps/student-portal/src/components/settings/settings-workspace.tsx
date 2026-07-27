"use client";

import { useEffect, useState } from "react";
import { SettingsHero } from "@/components/settings/settings-hero";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { SettingsProfileForm } from "@/components/settings/settings-profile-form";
import { SettingsLearningOverview } from "@/components/settings/settings-learning-overview";
import { SettingsLearningForm } from "@/components/settings/settings-learning-form";
import { SettingsNotificationsForm } from "@/components/settings/settings-notifications-form";
import { SettingsSecurityForm } from "@/components/settings/settings-security-form";
import { SettingsSubscriptionPanel } from "@/components/settings/settings-subscription-panel";
import { SettingsAccountPanel } from "@/components/settings/settings-account-panel";
import { SettingsHelp } from "@/components/settings/settings-help";
import { SettingsRail } from "@/components/settings/settings-rail";
import type {
  SettingsPageData,
  SettingsTabId,
} from "@/lib/settings-shared";

const VALID_TABS = new Set<SettingsTabId>([
  "profile",
  "learning",
  "notifications",
  "security",
  "subscription",
  "account",
]);

export function SettingsWorkspace({
  data,
  initialTab,
  updateAction,
  uploadAvatarAction,
  updateNotificationPreferencesAction,
  updateLearningSettingsAction,
  changePasswordAction,
  deactivateAccountAction,
  flash,
}: {
  data: SettingsPageData;
  initialTab?: string | null;
  updateAction: (formData: FormData) => Promise<void>;
  uploadAvatarAction: (formData: FormData) => Promise<void>;
  updateNotificationPreferencesAction: (formData: FormData) => Promise<void>;
  updateLearningSettingsAction: (formData: FormData) => Promise<void>;
  changePasswordAction: (formData: FormData) => Promise<void>;
  deactivateAccountAction: (formData: FormData) => Promise<void>;
  flash: { saved?: boolean; error?: string | null };
}) {
  const startTab =
    initialTab && VALID_TABS.has(initialTab as SettingsTabId)
      ? (initialTab as SettingsTabId)
      : "profile";
  const [tab, setTab] = useState<SettingsTabId>(startTab);

  useEffect(() => {
    if (initialTab && VALID_TABS.has(initialTab as SettingsTabId)) {
      setTab(initialTab as SettingsTabId);
    }
  }, [initialTab]);

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
          <p className="text-sm text-accent-green">Settings saved successfully.</p>
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
                uploadAvatarAction={uploadAvatarAction}
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
            <SettingsLearningForm
              prefs={data.learningPrefs}
              updateAction={updateLearningSettingsAction}
            />
          ) : null}

          {tab === "notifications" ? (
            <SettingsNotificationsForm
              prefs={data.notificationPrefs}
              updateAction={updateNotificationPreferencesAction}
            />
          ) : null}

          {tab === "security" ? (
            <SettingsSecurityForm changePasswordAction={changePasswordAction} />
          ) : null}

          {tab === "subscription" ? (
            <SettingsSubscriptionPanel plan={data.plan} />
          ) : null}

          {tab === "account" ? (
            <SettingsAccountPanel deactivateAction={deactivateAccountAction} />
          ) : null}
        </div>

        <SettingsRail plan={data.plan} onGoToAccount={() => setTab("account")} />
      </div>
    </div>
  );
}
