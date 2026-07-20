import Link from "next/link";
import {
  Check,
  FileText,
  Robot,
  ShieldCheck,
  Target,
} from "@phosphor-icons/react/dist/ssr";
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
          <div className="mt-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-scalex-red/15 text-scalex-red metallic-edge">
              <Target weight="duotone" className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              Objective
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{objective}</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gold/15 text-accent-gold metallic-edge">
              <ShieldCheck weight="duotone" className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              Why This Matters
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{whyThisMatters}</p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple metallic-edge">
              <FileText weight="duotone" className="h-4 w-4" aria-hidden />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              Submission Requirements
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {requirements.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-0.5 text-accent-green" aria-hidden>
                  <Check weight="bold" className="h-4 w-4" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple/15 text-accent-purple metallic-edge">
            <Robot weight="duotone" className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="font-display text-lg font-semibold">AI Task Assistant</h2>
        </div>
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
