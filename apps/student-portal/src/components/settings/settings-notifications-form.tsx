"use client";

import { Card } from "@scalex/ui";
import type { SettingsNotificationPrefs } from "@/lib/settings-shared";

function ToggleRow({
  name,
  label,
  description,
  defaultChecked,
  disabled,
}: {
  name?: string;
  label: string;
  description: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-3/40 px-4 py-3 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{description}</span>
      </span>
      <input
        type="checkbox"
        name={disabled ? undefined : name}
        value="true"
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="h-5 w-5 rounded border-line accent-[var(--accent-purple,#8b5cf6)]"
      />
    </label>
  );
}

export function SettingsNotificationsForm({
  prefs,
  updateAction,
}: {
  prefs: SettingsNotificationPrefs;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Notification Settings
      </p>
      <p className="mt-2 text-sm text-muted">
        Payment and security alerts always stay on. Other channels respect these
        toggles.
      </p>

      <form action={updateAction} className="mt-5 space-y-3">
        <input type="hidden" name="return_tab" value="notifications" />
        <ToggleRow
          name="in_app"
          label="In-app"
          description="Show alerts in the ScaleX notification center"
          defaultChecked={prefs.inApp}
        />
        <ToggleRow
          name="email"
          label="Email"
          description="Send non-critical updates to your inbox"
          defaultChecked={prefs.email}
        />
        <ToggleRow
          label="Browser"
          description="Not available yet"
          defaultChecked={false}
          disabled
        />
        <ToggleRow
          label="Push"
          description="Not available yet"
          defaultChecked={false}
          disabled
        />
        <ToggleRow
          label="WhatsApp"
          description="Not available yet"
          defaultChecked={false}
          disabled
        />

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
          >
            Save Notification Preferences
          </button>
        </div>
      </form>
    </Card>
  );
}
