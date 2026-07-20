import Link from "next/link";
import { Card } from "@scalex/ui";

export function WhyAndLearn({
  whyThisMatters,
  learnItems,
  unlocksLabel,
}: {
  whyThisMatters: string;
  learnItems: string[];
  unlocksLabel: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="relative overflow-hidden">
        <h2 className="font-display text-lg font-semibold">Why This Matters</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{whyThisMatters}</p>
        <div className="mt-5 rounded-xl border border-line bg-surface-3/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Completing this step unlocks
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-scalex-red">→</span>
            <p className="font-semibold text-foreground">{unlocksLabel}</p>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">What You&apos;ll Learn</h2>
          <TargetGraphic />
        </div>
        {learnItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Lessons for this stage will appear here once content is published.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {learnItems.slice(0, 6).map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-accent-green" aria-hidden>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                    <path
                      d="m3 8 3.5 3.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/roadmap"
          className="mt-5 inline-flex text-sm font-semibold text-scalex-red hover:underline"
        >
          See full roadmap →
        </Link>
      </Card>
    </div>
  );
}

function TargetGraphic() {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 text-scalex-red" fill="none" aria-hidden>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <path d="M34 10l4-4M34 10h6M34 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
