import Link from "next/link";
import { Check, Robot } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";

export function RoadmapRail({
  unlocksLabel,
  unlockPreview,
  aiPrompts,
}: {
  unlocksLabel: string;
  unlockPreview: string[];
  aiPrompts: string[];
}) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-20">
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          What You&apos;ll Unlock
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-foreground">
          {unlocksLabel}
        </h3>
        {unlockPreview.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Finish your current stage to reveal the next lessons.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {unlockPreview.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="mt-0.5 text-accent-green" aria-hidden>
                  <Check weight="bold" className="h-4 w-4" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple metallic-edge">
            <Robot weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <h3 className="font-display text-lg font-semibold">AI Assistant</h3>
        </div>
        <p className="mt-1 text-sm text-muted">
          Suggested questions for your current stage
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
        <Link
          href="/ai-mentor"
          className="mt-4 inline-flex text-sm font-semibold text-scalex-red hover:underline"
        >
          Open AI Chat →
        </Link>
      </Card>
    </aside>
  );
}
