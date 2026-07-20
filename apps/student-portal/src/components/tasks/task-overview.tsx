import Link from "next/link";
import { Card } from "@scalex/ui";

export function TaskOverview({
  objective,
  whyThisMatters,
  requirements,
  aiPrompts,
}: {
  objective: string;
  whyThisMatters: string;
  requirements: string[];
  aiPrompts: string[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Task Overview</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-subtle">
            Objective
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{objective}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Why This Matters
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{whyThisMatters}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
            Submission Requirements
          </p>
          <ul className="mt-3 space-y-2">
            {requirements.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-accent-green" aria-hidden>
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                    <path d="m3 8 3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold">AI Task Assistant</h2>
        <p className="mt-1 text-sm text-muted">
          Get help preparing a strong submission
        </p>
        <ul className="mt-4 space-y-2">
          {aiPrompts.map((prompt) => (
            <li key={prompt}>
              <Link
                href={`/ai-mentor?q=${encodeURIComponent(prompt)}`}
                className="block rounded-xl border border-line bg-surface-3/40 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-accent-purple/40 hover:bg-accent-purple/5"
              >
                {prompt}
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
