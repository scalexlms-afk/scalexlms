import Link from "next/link";
import {
  Robot,
  UserCircle,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
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
      icon: <Robot weight="duotone" className="h-5 w-5" />,
    },
    {
      title: "Book a Mentor",
      body: mentorBody,
      href: mentorHref,
      cta: mentorCta,
      iconClass: "bg-accent-amber/15 text-accent-amber",
      icon: <UserCircle weight="duotone" className="h-5 w-5" />,
    },
    {
      title: "Community",
      body: "Share wins, ask questions, and learn from other sellers.",
      href: "/community",
      cta: "Go now →",
      iconClass: "bg-accent-green/15 text-accent-green",
      icon: <UsersThree weight="duotone" className="h-5 w-5" />,
    },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">Need a hand?</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.title}
            variant="glass"
            interactive
            className="flex flex-col"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl metallic-edge ${item.iconClass}`}
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
