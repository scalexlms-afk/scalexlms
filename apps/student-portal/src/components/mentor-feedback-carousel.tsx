"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Quotes } from "@phosphor-icons/react";

const feedback = [
  {
    title: "Product research",
    quote:
      "Your demand signals are clear. Tighten the competition filter and resubmit with the revised margin calculation.",
  },
  {
    title: "Supplier selection",
    quote:
      "The shortlist is strong. Compare landed cost and lead time side by side before choosing the final supplier.",
  },
  {
    title: "Launch readiness",
    quote:
      "Your listing assets are ready. Complete the inventory and campaign checks before requesting milestone approval.",
  },
];

export function MentorFeedbackCarousel() {
  const [active, setActive] = useState(0);
  const item = feedback[active];

  function move(direction: -1 | 1) {
    setActive((current) => (current + direction + feedback.length) % feedback.length);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
      <div>
        <p className="text-sm font-medium text-scalex-red">Sample mentor feedback</p>
        <h2 className="mt-4 max-w-xl font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] sm:text-5xl">
          Clear feedback. Human approval.
        </h2>
        <p className="mt-5 max-w-md leading-relaxed text-muted">
          AI helps annotate the work. Your assigned mentor makes the final call
          on every milestone-gating task.
        </p>
      </div>

      <div
        aria-live="polite"
        className="metallic-graphite metallic-edge rounded-[var(--radius-card)] border border-line p-7 sm:p-10"
      >
        <Quotes weight="fill" className="h-9 w-9 text-scalex-red" />
        <p className="mt-8 font-display text-2xl font-medium leading-snug sm:text-3xl">
          “{item.quote}”
        </p>
        <div className="mt-9 flex items-center justify-between gap-5">
          <div>
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-sm text-muted">
              Example revision note
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous feedback"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-2 text-foreground transition hover:border-scalex-red/50 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next feedback"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-scalex-red text-white transition hover:bg-scalex-red-dark active:scale-95"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
