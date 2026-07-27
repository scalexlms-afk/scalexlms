"use client";

import {
  SETTINGS_TABS,
  type SettingsTabId,
} from "@/lib/settings-shared";

export function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
      {SETTINGS_TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "border-accent-purple text-accent-purple"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
