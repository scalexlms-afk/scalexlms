export const SETTINGS_SECTIONS = [
  { id: "general", label: "General" },
  { id: "branding", label: "Branding" },
  { id: "auth", label: "Auth & Security" },
  { id: "notifications", label: "Notifications" },
  { id: "email", label: "Email Templates" },
  { id: "integrations", label: "Integrations" },
  { id: "ai", label: "AI Settings" },
  { id: "storage", label: "File Storage" },
  { id: "backup", label: "Backup & Maintenance" },
  { id: "audit", label: "Audit Logs" },
  { id: "about", label: "About System" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export function parseSettingsSection(
  value: string | undefined
): SettingsSectionId {
  const match = SETTINGS_SECTIONS.find((s) => s.id === value);
  return match?.id ?? "general";
}

/** Sensitive sections stay super_admin-only via system_settings full access. */
export const SETTINGS_SENSITIVE_SECTIONS: SettingsSectionId[] = [
  "auth",
  "integrations",
  "ai",
  "storage",
  "backup",
  "audit",
];

export function maskConfiguredSecret(configured: boolean, prefix = "••••"): string {
  return configured ? `${prefix}•••••••• (configured)` : "Not configured";
}
