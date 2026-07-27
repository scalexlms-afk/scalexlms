"use client";

import { Card } from "@scalex/ui";
import type { SettingsLearningPrefs } from "@/lib/settings-shared";

const inputClass =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export function SettingsLearningForm({
  prefs,
  updateAction,
}: {
  prefs: SettingsLearningPrefs;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Learning Preferences
      </p>
      <p className="mt-2 text-sm text-muted">
        Choose how often you want progress digests and what hour reminders
        should prefer.
      </p>

      <form action={updateAction} className="mt-5 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Digest cadence
          </span>
          <select
            name="digestCadence"
            defaultValue={prefs.digestCadence}
            className={inputClass}
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Preferred reminder hour
          </span>
          <select
            name="reminderHour"
            defaultValue={String(prefs.reminderHour)}
            className={inputClass}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}:00
              </option>
            ))}
          </select>
          <p className="text-[11px] text-subtle">
            Stored in your timezone preference for future reminder jobs.
          </p>
        </label>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
          >
            Save Learning Preferences
          </button>
        </div>
      </form>
    </Card>
  );
}
