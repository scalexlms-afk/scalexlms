"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { CalendarBlank, X } from "@phosphor-icons/react";
import { Button } from "@scalex/ui";
import { requestMentorCallAction } from "@/app/(portal)/messages/actions";

const fieldClasses =
  "w-full rounded-xl border border-line bg-surface-3/80 px-3.5 py-2.5 text-sm text-foreground placeholder:text-subtle outline-none transition-colors focus:border-accent-purple/50 focus:ring-2 focus:ring-accent-purple/20";

function defaultLocalDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookCallButton({
  variant = "hero",
}: {
  variant?: "hero" | "chip";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setOpen(false);
    setError(null);
  }

  function onSubmit(formData: FormData) {
    setError(null);
    setDone(false);
    startTransition(async () => {
      try {
        await requestMentorCallAction(formData);
        setDone(true);
        setTimeout(() => {
          close();
          setDone(false);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not book call");
      }
    });
  }

  const triggerClass =
    variant === "hero"
      ? "inline-flex items-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3.5 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
      : "inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-3/60 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent-purple/40 hover:text-foreground";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        <CalendarBlank weight="bold" className="h-4 w-4" aria-hidden />
        Book Call
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed top-1/2 left-1/2 m-0 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        onClose={close}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple">
              <CalendarBlank weight="duotone" className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 id={titleId} className="font-display text-lg font-semibold">
                Book mentor call
              </h2>
              <p className="mt-1 text-sm text-muted">
                Request a private call with your assigned ScaleX mentor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-3 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form
          className="space-y-4 px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(new FormData(event.currentTarget));
          }}
        >
          <div>
            <label
              htmlFor="mentor-call-when"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Date &amp; time
            </label>
            <input
              id="mentor-call-when"
              name="scheduledAt"
              type="datetime-local"
              required
              defaultValue={defaultLocalDateTime()}
              className={fieldClasses}
            />
          </div>
          <div>
            <label
              htmlFor="mentor-call-duration"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Duration
            </label>
            <select
              id="mentor-call-duration"
              name="durationMinutes"
              defaultValue="30"
              className={fieldClasses}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="mentor-call-notes"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Topic (optional)
            </label>
            <textarea
              id="mentor-call-notes"
              name="notes"
              rows={3}
              maxLength={1000}
              placeholder="What do you want to cover on the call?"
              className={fieldClasses}
            />
          </div>

          {error ? (
            <p className="text-sm text-accent-danger">{error}</p>
          ) : null}
          {done ? (
            <p className="text-sm font-medium text-accent-green">
              Request sent to your mentor.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <button
              type="submit"
              disabled={pending || done}
              className="inline-flex items-center justify-center rounded-xl bg-accent-purple px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(139,92,246,0.9)] transition hover:bg-accent-purple/90 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Request call"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
