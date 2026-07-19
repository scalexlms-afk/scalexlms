"use client";

import { useState } from "react";
import { landingFaqItems } from "@/lib/structured-data/faq";

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-center text-3xl font-bold text-foreground sm:text-4xl">
          Amazon FBA FAQ
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted">
          Straight answers on private label, the 8-milestone roadmap, mentorship,
          and how ScaleX LaunchPad gets you from beginner to launch.
        </p>
        <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-surface-raised">
          {landingFaqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="pr-4 font-medium text-foreground">
                    {item.question}
                  </span>
                  <span
                    className="shrink-0 text-xl text-muted"
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-6 pb-5 text-muted leading-relaxed">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
