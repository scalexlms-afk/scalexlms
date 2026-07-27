import { Bell } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";

export function SessionsFooterCta() {
  return (
    <Card className="border-accent-purple/20 bg-gradient-to-r from-accent-purple/12 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge"
            aria-hidden
          >
            <Bell weight="fill" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              Never miss a live class
            </p>
            <p className="mt-1 text-sm text-muted">
              Session reminders are coming soon — stay tuned.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          title="Coming soon"
          className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-line bg-surface-3/50 px-4 py-2.5 text-sm font-semibold text-subtle opacity-60"
        >
          Enable reminders
        </button>
      </div>
    </Card>
  );
}
