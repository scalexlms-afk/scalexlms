import Link from "next/link";
import { Card } from "@scalex/ui";

export function HelpLinks({ premium }: { premium: boolean }) {
  const mentorHref = premium ? "/messages" : "/payment?mode=upgrade";
  const mentorCta = premium ? "Chat now →" : "Upgrade to book →";
  const mentorBody = premium
    ? "Message your assigned mentor for 1:1 guidance."
    : "Private mentor chat is included in the Premium Launch Program.";

  const items = [
    {
      title: "Ask AI Mentor",
      body: "Get instant answers grounded in ScaleX academy content.",
      href: "/ai-mentor",
      cta: "Chat →",
      iconClass: "bg-accent-purple/15 text-accent-purple",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M9 15V9h2.2c1.4 0 2.3.8 2.3 2s-.9 2-2.3 2H10.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Book a Mentor",
      body: mentorBody,
      href: mentorHref,
      cta: mentorCta,
      iconClass: "bg-accent-amber/15 text-accent-amber",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 19a7 7 0 0 1 14 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      title: "Community",
      body: "Share wins, ask questions, and learn from other sellers.",
      href: "/community",
      cta: "Go now →",
      iconClass: "bg-accent-green/15 text-accent-green",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path
            d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 18v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1M12 18v-1a4 4 0 0 1 4-4h0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">Need a hand?</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Card key={item.title} interactive className="flex flex-col">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconClass}`}
            >
              {item.icon}
            </span>
            <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted">{item.body}</p>
            <Link
              href={item.href}
              className="mt-4 text-sm font-semibold text-scalex-red hover:underline"
            >
              {item.cta}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
