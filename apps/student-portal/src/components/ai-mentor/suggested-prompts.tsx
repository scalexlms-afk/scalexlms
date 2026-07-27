"use client";

import {
  BookOpenText,
  FileMagnifyingGlass,
  Lightbulb,
  ListChecks,
  Path,
  WarningCircle,
} from "@phosphor-icons/react";

export type SuggestedPrompt = {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  icon: "explain" | "review" | "next" | "mistakes" | "example" | "summarize";
};

const ICONS = {
  explain: BookOpenText,
  review: FileMagnifyingGlass,
  next: Path,
  mistakes: WarningCircle,
  example: Lightbulb,
  summarize: ListChecks,
} as const;

export function buildSuggestedPrompts(milestoneTitle: string): SuggestedPrompt[] {
  return [
    {
      id: "explain",
      title: "Explain this lesson",
      subtitle: "In simple words",
      icon: "explain",
      prompt: `Explain my current lesson in the ${milestoneTitle} milestone in simple words, using ScaleX academy content.`,
    },
    {
      id: "review",
      title: "Review my document",
      subtitle: "Before submission",
      icon: "review",
      prompt: `Help me review my ${milestoneTitle} task document before I submit it. Give a checklist of what mentors look for.`,
    },
    {
      id: "next",
      title: "What should I do next?",
      subtitle: "My next best action",
      icon: "next",
      prompt: `Based on the ${milestoneTitle} stage, what should I do next in ScaleX LaunchPad?`,
    },
    {
      id: "mistakes",
      title: "Common mistakes",
      subtitle: "In this step",
      icon: "mistakes",
      prompt: `What are common mistakes students make in the ${milestoneTitle} milestone, according to ScaleX lessons?`,
    },
    {
      id: "example",
      title: "Show me an example",
      subtitle: "Real life example",
      icon: "example",
      prompt: `Show a practical real-world example related to the ${milestoneTitle} milestone from ScaleX curriculum.`,
    },
    {
      id: "summarize",
      title: "Summarize this lesson",
      subtitle: "Key takeaways",
      icon: "summarize",
      prompt: `Summarize the key takeaways for my current lesson in ${milestoneTitle}.`,
    },
  ];
}

export function SuggestedPrompts({
  prompts,
  onSelect,
  disabled,
}: {
  prompts: SuggestedPrompt[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(item.prompt)}
            className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2/60 px-3.5 py-3 text-left transition hover:border-accent-purple/40 hover:bg-accent-purple/5 disabled:opacity-50"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-purple/15 text-accent-purple">
              <Icon weight="duotone" className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">
                {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{item.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
