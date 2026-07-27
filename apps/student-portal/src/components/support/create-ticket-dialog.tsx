"use client";

import { useEffect, useId, useRef } from "react";
import { Ticket, X } from "@phosphor-icons/react";
import { Button } from "@scalex/ui";

const fieldClasses =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

export function CreateTicketDialog({
  open,
  onClose,
  action,
}: {
  open: boolean;
  onClose: () => void;
  action: (formData: FormData) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-blue/20 text-accent-blue">
            <Ticket weight="duotone" className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold">
              Create support ticket
            </h2>
            <p className="mt-1 text-sm text-muted">
              Describe the issue and our team will follow up.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <form action={action} className="space-y-4 px-5 py-4">
        <div>
          <label
            htmlFor="support-ticket-subject"
            className="mb-1.5 block text-sm font-medium text-muted"
          >
            Subject
          </label>
          <input
            id="support-ticket-subject"
            name="subject"
            required
            maxLength={200}
            placeholder="e.g. Cannot access live class recording"
            className={fieldClasses}
          />
        </div>
        <div>
          <label
            htmlFor="support-ticket-body"
            className="mb-1.5 block text-sm font-medium text-muted"
          >
            Message
          </label>
          <textarea
            id="support-ticket-body"
            name="body"
            required
            rows={5}
            maxLength={5000}
            placeholder="Share details so we can help quickly…"
            className={fieldClasses}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(59,130,246,0.9)] transition hover:bg-accent-blue/90"
          >
            Submit ticket
          </button>
        </div>
      </form>
    </dialog>
  );
}
