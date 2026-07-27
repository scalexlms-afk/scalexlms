"use client";

import Image from "next/image";
import { Camera, CheckCircle, Moon } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import {
  profileInitials,
  type SettingsProfile,
} from "@/lib/settings-shared";

const inputClass =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20 disabled:cursor-not-allowed disabled:opacity-60";

export function SettingsProfileForm({
  profile,
  updateAction,
}: {
  profile: SettingsProfile;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const initials = profileInitials(profile.name);

  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Profile Information
      </p>

      <div className="mt-5 flex flex-wrap items-start gap-5">
        <div className="relative shrink-0">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={88}
              height={88}
              unoptimized
              className="h-22 w-22 h-[88px] w-[88px] rounded-full object-cover ring-2 ring-line"
            />
          ) : (
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-accent-purple/20 text-lg font-bold text-accent-purple ring-2 ring-line">
              {initials}
            </div>
          )}
          <button
            type="button"
            disabled
            title="Coming soon"
            className="absolute bottom-0 right-0 flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-accent-purple text-white opacity-70 shadow-lg"
            aria-label="Upload avatar (coming soon)"
          >
            <Camera weight="bold" className="h-4 w-4" aria-hidden />
          </button>
          <p className="mt-2 max-w-[88px] text-center text-[10px] text-subtle">
            JPG, PNG or GIF. Max. 2MB
          </p>
        </div>

        <form action={updateAction} className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Full Name
              </span>
              <input
                name="name"
                type="text"
                required
                defaultValue={profile.name}
                className={inputClass}
                autoComplete="name"
              />
            </label>

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Email Address
              </span>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  disabled
                  className={inputClass}
                />
                <CheckCircle
                  weight="fill"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent-green"
                  aria-hidden
                />
              </div>
            </label>

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Phone Number
              </span>
              <input
                name="phone"
                type="tel"
                defaultValue={profile.phone ?? ""}
                placeholder="+92 300 1234567"
                className={inputClass}
                autoComplete="tel"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Country
              </span>
              <select disabled title="Coming soon" className={inputClass}>
                <option>Pakistan</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Language
              </span>
              <select disabled title="Coming soon" className={inputClass}>
                <option>English</option>
              </select>
            </label>

            <label className="block space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Interface Theme
              </span>
              <div className="relative">
                <select disabled title="Use the theme toggle above" className={inputClass}>
                  <option>Dark</option>
                </select>
                <Moon
                  weight="duotone"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
              </div>
              <p className="text-[11px] text-subtle">
                Use the sun/moon toggle in the header to switch themes.
              </p>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}
