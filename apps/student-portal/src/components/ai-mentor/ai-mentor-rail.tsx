"use client";

import Link from "next/link";
import {
  CheckCircle,
  FileText,
  ListChecks,
  Path,
  Robot,
  Translate,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type { AiMentorContext } from "@/lib/ai-mentor";

export type AiAction = {
  id: string;
  label: string;
  prompt: string;
  tone: "red" | "amber" | "blue" | "green" | "purple";
};

export function buildAiActions(ctx: AiMentorContext): AiAction[] {
  const lesson = ctx.currentLessonTitle ?? "my current lesson";
  const milestone = ctx.milestoneTitle;
  return [
    {
      id: "eli15",
      label: "Explain Like I'm 15",
      tone: "red",
      prompt: `Explain "${lesson}" (${milestone}) like I'm 15 years old, using ScaleX academy content.`,
    },
    {
      id: "summarize",
      label: "Summarize This Lesson",
      tone: "amber",
      prompt: `Summarize "${lesson}" in the ${milestone} milestone with key takeaways from ScaleX lessons.`,
    },
    {
      id: "checklist",
      label: "Generate Checklist",
      tone: "blue",
      prompt: `Generate a practical checklist for completing "${ctx.currentTaskTitle ?? lesson}" in ${milestone}.`,
    },
    {
      id: "review",
      label: "Review My Submission",
      tone: "green",
      prompt: `Act as a ScaleX mentor pre-reviewing my upcoming submission for "${ctx.currentTaskTitle ?? milestone}". Ask for gaps and give a readiness checklist.`,
    },
    {
      id: "plan",
      label: "Create Action Plan",
      tone: "green",
      prompt: `Create a 7-day action plan for the ${milestone} milestone based on ScaleX curriculum.`,
    },
    {
      id: "translate",
      label: "Translate (Urdu / Arabic)",
      tone: "purple",
      prompt: `Translate the key points of my current ${milestone} lesson into both Urdu and Arabic, keeping Amazon FBA terms clear.`,
    },
  ];
}

const TONE: Record<AiAction["tone"], string> = {
  red: "bg-scalex-red/15 text-scalex-red",
  amber: "bg-accent-amber/15 text-accent-amber",
  blue: "bg-accent-blue/15 text-accent-blue",
  green: "bg-accent-green/15 text-accent-green",
  purple: "bg-accent-purple/15 text-accent-purple",
};

export function AiMentorRail({
  context,
  onAction,
  disabled,
}: {
  context: AiMentorContext;
  onAction: (prompt: string) => void;
  disabled?: boolean;
}) {
  const actions = buildAiActions(context);

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <Card className="border-accent-purple/20">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your Learning Context
        </p>
        <dl className="mt-3 space-y-2.5 text-sm">
          <div>
            <dt className="text-xs text-muted">Course</dt>
            <dd className="font-medium text-foreground">{context.courseTitle}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Milestone</dt>
            <dd className="font-medium text-accent-purple">
              {context.milestoneTitle}{" "}
              <span className="text-muted">
                (Step {context.milestoneIndex} of {context.milestoneTotal})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Current Lesson</dt>
            <dd className="font-medium text-foreground">
              {context.currentLessonTitle ?? "All lessons complete in stage"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Current Task</dt>
            <dd className="font-medium text-foreground">
              {context.currentTaskTitle ?? "No gating task yet"}
            </dd>
          </div>
        </dl>
        <Link
          href={context.continueHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent-purple/40 bg-accent-purple/10 px-3 py-2.5 text-sm font-semibold text-accent-purple transition hover:bg-accent-purple/15"
        >
          <ArrowClockwise weight="bold" className="h-4 w-4" aria-hidden />
          Continue learning
        </Link>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          AI Actions
        </p>
        <ul className="mt-3 space-y-1.5">
          {actions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onAction(action.prompt)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-foreground transition hover:bg-surface-3/70 disabled:opacity-50"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONE[action.tone]}`}
                >
                  {action.id === "eli15" ? (
                    <Robot weight="duotone" className="h-4 w-4" />
                  ) : action.id === "summarize" ? (
                    <FileText weight="duotone" className="h-4 w-4" />
                  ) : action.id === "checklist" ? (
                    <ListChecks weight="duotone" className="h-4 w-4" />
                  ) : action.id === "review" ? (
                    <CheckCircle weight="duotone" className="h-4 w-4" />
                  ) : action.id === "plan" ? (
                    <Path weight="duotone" className="h-4 w-4" />
                  ) : (
                    <Translate weight="duotone" className="h-4 w-4" />
                  )}
                </span>
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Quick Resources
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          {[
            { href: context.continueHref, label: "Current lesson" },
            { href: "/tasks", label: "Task guidelines" },
            { href: "/community", label: "Community discussion" },
            { href: "/roadmap", label: "Full roadmap" },
          ].map((link) => (
            <li key={link.href + link.label}>
              <Link
                href={link.href}
                className="block rounded-lg px-2 py-2 text-muted transition hover:bg-surface-3/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <span
              className="block cursor-not-allowed rounded-lg px-2 py-2 text-subtle"
              title="Coming soon"
            >
              Lesson PDF / Templates
            </span>
          </li>
        </ul>
      </Card>
    </aside>
  );
}
