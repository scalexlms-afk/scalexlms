"use client";

import { DownloadSimple, Trash } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";

const inputClass =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-scalex-red/50 focus:ring-2 focus:ring-scalex-red/20";

export function SettingsAccountPanel({
  deactivateAction,
}: {
  deactivateAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Download my data
        </p>
        <p className="mt-2 text-sm text-muted">
          Export a JSON copy of your profile, enrollments, submissions,
          payments, tickets, and related records.
        </p>
        <a
          href="/api/account/export"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-3/50 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-3"
        >
          <DownloadSimple weight="duotone" className="h-4 w-4" aria-hidden />
          Download JSON
        </a>
      </Card>

      <Card className="border-scalex-red/30">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-scalex-red/15 text-scalex-red">
            <Trash weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-scalex-red">
              Deactivate account
            </p>
            <p className="mt-2 text-sm text-muted">
              Soft-deactivates your student account and signs you out. Type{" "}
              <span className="font-semibold text-foreground">DEACTIVATE</span>{" "}
              to confirm.
            </p>

            <form action={deactivateAction} className="mt-4 space-y-3">
              <input
                name="confirm"
                type="text"
                required
                placeholder="DEACTIVATE"
                autoComplete="off"
                className={inputClass}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-scalex-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-scalex-red/90"
              >
                Deactivate account
              </button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
