import Link from "next/link";
import {
  AdminFilterTabs,
  AdminPageHeader,
  AdminPanel,
  AdminSplit,
  AdminDetailRail,
} from "@/components/admin-ui";
import { Field } from "@/components/field";
import { requireAdminProfile, requireFeaturePage } from "@/lib/auth";
import {
  getPaymentPlanSettings,
  getPlatformSettings,
  getRecentAuditLogs,
  getStaffNotificationPrefs,
} from "@/lib/data";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { canAccess } from "@scalex/db/rbac";
import {
  PLAN_FEATURES,
  planLabel,
  normalizePlan,
  type PaymentPlanSetting,
} from "@scalex/db";
import { Button, DataTable, StatusPill } from "@scalex/ui";
import {
  updatePaymentPlanAction,
  updatePlatformSettingAction,
  updateStaffNotificationPrefsAction,
  updateStaffProfileAction,
  runPlatformBackupAction,
} from "./actions";
import {
  SETTINGS_SECTIONS,
  SETTINGS_SENSITIVE_SECTIONS,
  maskConfiguredSecret,
  parseSettingsSection,
  type SettingsSectionId,
} from "./sections";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && !Number.isNaN(value) ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function SaveBar({ label = "Save Changes" }: { label?: string }) {
  return (
    <div className="mt-6 flex justify-end border-t border-line pt-4">
      <Button type="submit">{label}</Button>
    </div>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; saved?: string }>;
}) {
  const { profile, userId } = await requireAdminProfile();
  requireFeaturePage(profile.role, "system_settings", "full");

  const params = await searchParams;
  const section = parseSettingsSection(params.section);
  const isSuperAdmin = profile.role === "super_admin";
  const canSensitive =
    isSuperAdmin || canAccess(profile.role, "system_settings", "full");

  const activeSection: SettingsSectionId =
    SETTINGS_SENSITIVE_SECTIONS.includes(section) && !canSensitive
      ? "general"
      : section;

  const platformKeys = [
    "branding",
    "auth",
    "email",
    "ai",
    "storage",
    "backup",
  ] as const;

  const [planSettings, auditLogs, notifPrefs, platformSettings] =
    await Promise.all([
      getPaymentPlanSettings(),
      activeSection === "audit" ? getRecentAuditLogs(50) : Promise.resolve([]),
      activeSection === "notifications"
        ? getStaffNotificationPrefs(userId)
        : Promise.resolve(null),
      getPlatformSettings([...platformKeys]),
    ]);

  const branding = platformSettings.branding ?? {};
  const authPrefs = platformSettings.auth ?? {};
  const emailPrefs = platformSettings.email ?? {};
  const aiPrefs = platformSettings.ai ?? {};
  const storagePrefs = platformSettings.storage ?? {};
  const backupPrefs = platformSettings.backup ?? {};

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const longcatConfigured = Boolean(
    process.env.LONGCAT_API_KEY || process.env.OPENAI_API_KEY
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const sectionTabs = SETTINGS_SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    href: `/settings?section=${s.id}`,
  })).filter((s) => {
    if (
      SETTINGS_SENSITIVE_SECTIONS.includes(s.id as SettingsSectionId) &&
      !canSensitive
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="System"
        title="Platform settings"
        description="Academy configuration across general, security, integrations, and maintenance."
        secondaryAction={
          <>
            <Link href="/team" className="admin-btn-secondary">
              Team Members
            </Link>
            <Link href="/roles" className="admin-btn-secondary">
              Roles & Permissions
            </Link>
          </>
        }
      />

      {params.saved ? (
        <div className="rounded-xl border border-accent-green/40 bg-accent-green/5 px-4 py-3 text-sm text-accent-green">
          Changes saved.
        </div>
      ) : null}

      <AdminFilterTabs active={activeSection} tabs={sectionTabs} />

      <AdminSplit
        main={
          <div className="space-y-4">
            {activeSection === "general" ? (
              <>
                <AdminPanel>
                  <SectionIntro
                    title="General"
                    description="Your staff profile and academy billing defaults."
                  />
                  <form action={updateStaffProfileAction} className="space-y-4">
                    <input type="hidden" name="section" value="general" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Display name"
                        name="name"
                        required
                        defaultValue={profile.name}
                      />
                      <Field
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={profile.email}
                        disabled
                      />
                      <Field
                        label="Phone"
                        name="phone"
                        defaultValue={profile.phone ?? ""}
                      />
                      <Field
                        label="Country"
                        name="country"
                        defaultValue={profile.country ?? ""}
                      />
                      <Field
                        label="Language"
                        name="language"
                        defaultValue={profile.language ?? "en"}
                      />
                    </div>
                    <p className="text-xs text-subtle">
                      Email is managed via Auth. Role changes live on{" "}
                      <Link
                        href="/team"
                        className="font-semibold text-scalex-red hover:underline"
                      >
                        Team Members
                      </Link>
                      .
                    </p>
                    <SaveBar />
                  </form>
                </AdminPanel>

                <AdminPanel title="Payment plan defaults">
                  <p className="mb-4 text-sm text-muted">
                    Configure Standard and Premium Launch Program pricing
                    (stored in `payment_plan_settings`).
                  </p>
                  <div className="space-y-4">
                    {(planSettings as PaymentPlanSetting[]).map((plan) => {
                      const planType = normalizePlan(plan.plan_type);
                      return (
                        <form
                          key={plan.id}
                          action={updatePaymentPlanAction}
                          className="grid gap-3 rounded-xl border border-line bg-surface-3 p-4 sm:grid-cols-4"
                        >
                          <input type="hidden" name="planId" value={plan.id} />
                          <input type="hidden" name="section" value="general" />
                          <div className="sm:col-span-4">
                            <p className="font-display text-base font-semibold">
                              {planLabel(planType)}
                            </p>
                            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                              {PLAN_FEATURES[planType].map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-start gap-2 text-xs text-muted"
                                >
                                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-scalex-red" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Field
                            label="Total (cents)"
                            name="totalCents"
                            type="number"
                            defaultValue={String(plan.total_cents)}
                          />
                          <Field
                            label="First %"
                            name="firstPercent"
                            type="number"
                            defaultValue={String(plan.first_payment_percent)}
                          />
                          <Field
                            label="Remaining %"
                            name="remainingPercent"
                            type="number"
                            defaultValue={String(plan.remaining_percent)}
                          />
                          <div className="flex items-end">
                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </div>
                          <p className="sm:col-span-4 text-xs text-muted">
                            Current: {formatCurrency(plan.total_cents)} ·{" "}
                            {plan.first_payment_percent}% /{" "}
                            {plan.remaining_percent}%
                          </p>
                        </form>
                      );
                    })}
                  </div>
                </AdminPanel>
              </>
            ) : null}

            {activeSection === "branding" ? (
              <AdminPanel>
                <SectionIntro
                  title="Branding"
                  description="Logo, colors, and portal chrome preferences (platform_settings.branding)."
                />
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="branding" />
                  <input type="hidden" name="section" value="branding" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Academy name"
                      name="academyName"
                      defaultValue={str(
                        branding.academyName,
                        "ScaleX LaunchPad"
                      )}
                    />
                    <Field
                      label="Tagline"
                      name="tagline"
                      defaultValue={str(
                        branding.tagline,
                        "Learn. Build. Launch. Grow."
                      )}
                    />
                    <Field
                      label="Primary accent"
                      name="accent"
                      defaultValue={str(branding.accent, "#e11d48")}
                    />
                    <Field
                      label="Support email"
                      name="supportEmail"
                      type="email"
                      defaultValue={str(
                        branding.supportEmail,
                        "support@scalexlms.com"
                      )}
                    />
                  </div>
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "auth" ? (
              <AdminPanel>
                <SectionIntro
                  title="Auth & Security"
                  description="Non-secret session policy preferences. Provider secrets stay in env."
                />
                <div className="mb-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>Email / password</span>
                    <StatusPill label="Enabled" variant="approved" />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>Service role key</span>
                    <span className="font-mono text-xs text-muted">
                      {maskConfiguredSecret(
                        Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
                        "sb_"
                      )}
                    </span>
                  </div>
                </div>
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="auth" />
                  <input type="hidden" name="section" value="auth" />
                  <Field
                    label="Session length (days)"
                    name="sessionDays"
                    type="number"
                    defaultValue={String(num(authPrefs.sessionDays, 7))}
                  />
                  <label className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm">
                    <span>Require email verification</span>
                    <input
                      type="checkbox"
                      name="requireEmailVerification"
                      defaultChecked={bool(
                        authPrefs.requireEmailVerification,
                        true
                      )}
                      className="h-4 w-4 accent-[var(--color-scalex-red)]"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm">
                    <span>Allow password reset</span>
                    <input
                      type="checkbox"
                      name="allowPasswordReset"
                      defaultChecked={bool(authPrefs.allowPasswordReset, true)}
                      className="h-4 w-4 accent-[var(--color-scalex-red)]"
                    />
                  </label>
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "notifications" && notifPrefs ? (
              <AdminPanel>
                <SectionIntro
                  title="Notifications"
                  description="Your staff notification channels (notification_preferences)."
                />
                <form
                  action={updateStaffNotificationPrefsAction}
                  className="space-y-3"
                >
                  <input type="hidden" name="section" value="notifications" />
                  {(
                    [
                      {
                        name: "in_app",
                        label: "In-app",
                        checked: notifPrefs.in_app,
                        live: true,
                      },
                      {
                        name: "email",
                        label: "Email",
                        checked: notifPrefs.email,
                        live: true,
                      },
                      {
                        name: "browser",
                        label: "Browser",
                        checked: notifPrefs.browser,
                        live: false,
                      },
                      {
                        name: "push",
                        label: "Push",
                        checked: notifPrefs.push,
                        live: false,
                      },
                      {
                        name: "whatsapp",
                        label: "WhatsApp",
                        checked: notifPrefs.whatsapp,
                        live: false,
                      },
                    ] as const
                  ).map((row) => (
                    <label
                      key={row.name}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        {row.label}
                        {!row.live ? (
                          <span className="text-xs text-subtle">
                            Coming soon
                          </span>
                        ) : null}
                      </span>
                      <input
                        type="checkbox"
                        name={row.name}
                        defaultChecked={row.checked}
                        disabled={!row.live}
                        className="h-4 w-4 accent-[var(--color-scalex-red)]"
                      />
                    </label>
                  ))}
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "email" ? (
              <AdminPanel>
                <SectionIntro
                  title="Email Templates"
                  description="Transactional template toggles and sender prefs (platform_settings.email)."
                />
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="email" />
                  <input type="hidden" name="section" value="email" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="From name"
                      name="fromName"
                      defaultValue={str(emailPrefs.fromName, "ScaleX LaunchPad")}
                    />
                    <Field
                      label="Reply-to"
                      name="replyTo"
                      type="email"
                      defaultValue={str(
                        emailPrefs.replyTo,
                        "support@scalexlms.com"
                      )}
                    />
                  </div>
                  {(
                    [
                      {
                        name: "welcomeEnabled",
                        label: "Welcome / account activation",
                        checked: bool(emailPrefs.welcomeEnabled, true),
                      },
                      {
                        name: "reviewEnabled",
                        label: "Task review decision",
                        checked: bool(emailPrefs.reviewEnabled, true),
                      },
                      {
                        name: "sessionReminderEnabled",
                        label: "Live session reminder",
                        checked: bool(emailPrefs.sessionReminderEnabled, true),
                      },
                      {
                        name: "paymentReceiptEnabled",
                        label: "Payment receipt",
                        checked: bool(emailPrefs.paymentReceiptEnabled, true),
                      },
                    ] as const
                  ).map((row) => (
                    <label
                      key={row.name}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm"
                    >
                      <span>{row.label}</span>
                      <input
                        type="checkbox"
                        name={row.name}
                        defaultChecked={row.checked}
                        className="h-4 w-4 accent-[var(--color-scalex-red)]"
                      />
                    </label>
                  ))}
                  <p className="text-xs text-subtle">
                    Provider: {maskConfiguredSecret(resendConfigured, "re_")} —
                    keys stay in env.
                  </p>
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "integrations" ? (
              <AdminPanel>
                <SectionIntro
                  title="Integrations"
                  description="Third-party credentials are read from environment variables and never shown in full."
                />
                <div className="space-y-3 text-sm">
                  {[
                    {
                      name: "Stripe",
                      value: maskConfiguredSecret(stripeConfigured, "sk_"),
                    },
                    {
                      name: "Resend / Email",
                      value: maskConfiguredSecret(resendConfigured, "re_"),
                    },
                    {
                      name: "Supabase URL",
                      value: supabaseUrl || "Not configured",
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface-3 px-4 py-3"
                    >
                      <span className="font-medium">{row.name}</span>
                      <span className="font-mono text-xs text-muted">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-subtle">
                  Update secrets via deployment env — not editable from this UI.
                </p>
              </AdminPanel>
            ) : null}

            {activeSection === "ai" ? (
              <AdminPanel>
                <SectionIntro
                  title="AI Settings"
                  description="Non-secret mentor prefs. Provider API keys stay in environment variables."
                />
                <div className="mb-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>LLM provider key</span>
                    <span className="font-mono text-xs text-muted">
                      {maskConfiguredSecret(longcatConfigured, "lc_")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>Auto-approve gating tasks</span>
                    <StatusPill label="Disabled" variant="approved" />
                  </div>
                </div>
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="ai" />
                  <input type="hidden" name="section" value="ai" />
                  <Field
                    label="Academy grounding %"
                    name="academyGroundingPercent"
                    type="number"
                    defaultValue={String(
                      num(aiPrefs.academyGroundingPercent, 80)
                    )}
                  />
                  <label className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm">
                    <span>AI pre-score submissions</span>
                    <input
                      type="checkbox"
                      name="evaluationEnabled"
                      defaultChecked={bool(aiPrefs.evaluationEnabled, true)}
                      className="h-4 w-4 accent-[var(--color-scalex-red)]"
                    />
                  </label>
                  <p className="text-xs text-subtle">
                    AI may pre-score submissions; mentors retain final approval.
                    Auto-approve of gating tasks cannot be enabled here.
                  </p>
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "storage" ? (
              <AdminPanel>
                <SectionIntro
                  title="File Storage"
                  description="Upload limits and signed URL prefs (platform_settings.storage)."
                />
                <div className="mb-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>Provider</span>
                    <span>Supabase Storage</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <span>Buckets</span>
                    <span className="text-muted">
                      submissions · community · resources · avatars
                    </span>
                  </div>
                </div>
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="storage" />
                  <input type="hidden" name="section" value="storage" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Max upload (MB)"
                      name="maxUploadMb"
                      type="number"
                      defaultValue={String(num(storagePrefs.maxUploadMb, 25))}
                    />
                    <Field
                      label="Signed URL TTL (minutes)"
                      name="signedUrlMinutes"
                      type="number"
                      defaultValue={String(
                        num(storagePrefs.signedUrlMinutes, 60)
                      )}
                    />
                  </div>
                  <SaveBar />
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "backup" ? (
              <AdminPanel>
                <SectionIntro
                  title="Backup & Maintenance"
                  description="Preferences and on-demand JSON snapshots to the platform-backups bucket."
                />
                <form action={updatePlatformSettingAction} className="space-y-4">
                  <input type="hidden" name="key" value="backup" />
                  <input type="hidden" name="section" value="backup" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Retention (days)"
                      name="retentionDays"
                      type="number"
                      defaultValue={String(num(backupPrefs.retentionDays, 30))}
                    />
                    <Field
                      label="Preferred window (UTC)"
                      name="preferredWindowUtc"
                      defaultValue={str(
                        backupPrefs.preferredWindowUtc,
                        "02:00–04:00"
                      )}
                    />
                  </div>
                  <label className="flex items-center justify-between rounded-xl border border-line bg-surface-3 px-4 py-3 text-sm">
                    <span>Notify on complete</span>
                    <input
                      type="checkbox"
                      name="notifyOnComplete"
                      defaultChecked={bool(backupPrefs.notifyOnComplete, true)}
                      className="h-4 w-4 accent-[var(--color-scalex-red)]"
                    />
                  </label>
                  {backupPrefs.lastRunAt || backupPrefs.lastStatus ? (
                    <p className="text-xs text-muted">
                      Last run:{" "}
                      {backupPrefs.lastRunAt
                        ? formatDateTime(String(backupPrefs.lastRunAt))
                        : "—"}
                      {backupPrefs.lastStatus
                        ? ` · status ${String(backupPrefs.lastStatus)}`
                        : ""}
                      {backupPrefs.lastPath
                        ? ` · ${String(backupPrefs.lastPath)}`
                        : ""}
                    </p>
                  ) : null}
                  <SaveBar label="Save preferences" />
                </form>
                <form action={runPlatformBackupAction} className="mt-4">
                  <input type="hidden" name="section" value="backup" />
                  <div className="rounded-xl border border-dashed border-line bg-surface-3 px-4 py-6 text-center">
                    <p className="text-sm font-medium">Run platform backup</p>
                    <p className="mt-1 text-xs text-muted">
                      Exports a metadata JSON snapshot to Storage (not a full
                      Postgres dump). Super Admin only.
                    </p>
                    <Button type="submit" className="mt-4" size="sm">
                      Run backup
                    </Button>
                  </div>
                </form>
              </AdminPanel>
            ) : null}

            {activeSection === "audit" ? (
              <AdminPanel title="Audit Logs">
                <p className="mb-4 text-sm text-muted">
                  Recent staff actions from `audit_log`.
                </p>
                <DataTable
                  rows={auditLogs}
                  getRowKey={(row) => row.id}
                  emptyMessage="No audit entries yet."
                  columns={[
                    {
                      key: "action",
                      header: "Action",
                      render: (row) => row.action,
                    },
                    {
                      key: "target",
                      header: "Target",
                      render: (row) =>
                        `${row.target_type}:${String(row.target_id).slice(0, 8)}`,
                    },
                    {
                      key: "actor",
                      header: "Actor",
                      render: (row) =>
                        (row.actor as { name: string } | null)?.name ?? "—",
                    },
                    {
                      key: "when",
                      header: "When",
                      render: (row) => formatDateTime(row.created_at),
                    },
                  ]}
                />
              </AdminPanel>
            ) : null}

            {activeSection === "about" ? (
              <AdminPanel>
                <SectionIntro
                  title="About System"
                  description="ScaleX Management OS build information."
                />
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Product
                    </dt>
                    <dd className="mt-1 font-medium">ScaleX Management OS</dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      App version
                    </dt>
                    <dd className="mt-1 font-medium">0.1.0</dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Stack
                    </dt>
                    <dd className="mt-1 font-medium">
                      Next.js 16 · Supabase · pnpm
                    </dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface-3 px-4 py-3">
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      Your role
                    </dt>
                    <dd className="mt-1 font-medium">{profile.role}</dd>
                  </div>
                </dl>
              </AdminPanel>
            ) : null}
          </div>
        }
        rail={
          <AdminDetailRail title="Settings guide">
            <div className="space-y-3 text-sm">
              <p className="text-muted">
                Live saves write to existing tables. Integrations remain
                env-status only (no secret writes from this UI).
              </p>
              <ul className="space-y-2 text-xs text-subtle">
                <li>· General — profile + payment_plan_settings</li>
                <li>· Branding / Auth / Email / AI / Storage / Backup — platform_settings</li>
                <li>· Notifications — notification_preferences</li>
                <li>· Audit Logs — audit_log</li>
                <li>· Integrations — env-backed, masked</li>
              </ul>
              <Link
                href="/team"
                className="inline-flex text-sm font-semibold text-scalex-red hover:underline"
              >
                Manage team roles →
              </Link>
            </div>
          </AdminDetailRail>
        }
      />
    </>
  );
}
