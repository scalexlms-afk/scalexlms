import type { Metadata } from "next";
import Link from "next/link";
import { Button, Logo } from "@scalex/ui";
import { LandingJsonLd } from "@/components/landing-json-ld";
import { pageMetadata } from "@/lib/seo";
import { defaultTitle, siteDescription } from "@/lib/site";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "ScaleX LaunchPad",
    description: siteDescription,
    path: "/",
  }),
  title: { absolute: defaultTitle },
};

const features = [
  {
    step: "Learn",
    title: "Structured milestones",
    body: "Follow an 8-milestone Amazon FBA roadmap built for momentum, not overwhelm.",
    color: "text-accent-blue",
    ring: "border-accent-blue/30 bg-accent-blue/10",
  },
  {
    step: "Build",
    title: "Mentor validation",
    body: "Complete lessons and tasks with checkpoints that confirm you're ready to advance.",
    color: "text-accent-purple",
    ring: "border-accent-purple/30 bg-accent-purple/10",
  },
  {
    step: "Launch",
    title: "Measurable progress",
    body: "Track completion in real time and always know your next best action.",
    color: "text-accent-green",
    ring: "border-accent-green/30 bg-accent-green/10",
  },
];

const milestones = [
  "Foundation",
  "Business Setup",
  "Brand Research",
  "Product Hunting",
  "Sourcing",
  "Brand Development",
  "Launch",
  "Scaling",
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-scalex-black">
      <LandingJsonLd />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-scalex-red/20 blur-[140px]" />
        <div className="absolute bottom-[-20%] right-[-5%] h-[420px] w-[520px] rounded-full bg-accent-purple/10 blur-[120px]" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link href="/login" prefetch={false}>
            <Button variant="tertiary" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register" prefetch={false}>
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6">
        <section className="animate-fade-up py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-text-secondary-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
            AI-powered Amazon FBA education
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Learn. Build.{" "}
            <span className="bg-gradient-to-r from-scalex-red to-scalex-red-dark bg-clip-text text-transparent">
              Launch. Grow.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-secondary-dark">
            The structured path from beginner to launched Amazon seller —
            milestone roadmaps, mentor validation, and measurable progress in
            one focused portal.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register" prefetch={false}>
              <Button size="lg">Start your journey</Button>
            </Link>
            <Link href="/login" prefetch={false}>
              <Button variant="secondary" size="lg">
                I already have an account
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-6 pb-16 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.step}
              className="animate-fade-up rounded-[var(--radius-card)] border border-white/[0.06] bg-scalex-charcoal p-6 transition-colors hover:border-white/[0.14]"
              style={{ animationDelay: `${(i + 1) * 90}ms` }}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold ${f.ring} ${f.color}`}
              >
                {i + 1}
              </div>
              <p
                className={`mt-5 text-xs font-semibold uppercase tracking-wider ${f.color}`}
              >
                {f.step}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold">
                {f.title}
              </h2>
              <p className="mt-2 text-sm text-text-secondary-dark">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-white/[0.06] py-16">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Built for Amazon FBA private label sellers
          </h2>
          <p className="mt-4 max-w-3xl text-text-secondary-dark">
            ScaleX LaunchPad is an execution system — not a passive course library.
            Students move through eight gated milestones with real deliverables,
            AI-assisted feedback, and human mentor approval before advancing.
            Whether you are starting from zero or refining your launch strategy,
            every lesson ladders up to a task you submit and a mentor reviews.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {milestones.map((name, i) => (
              <li
                key={name}
                className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
              >
                <span className="text-text-tertiary-dark">{i + 1}.</span>{" "}
                {name}
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-tertiary-dark sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo size="sm" showMark={false} />
            <p className="text-text-secondary-dark">
              Amazon FBA education with mentor validation
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link href="/register" className="text-scalex-red hover:underline">
              Enroll in ScaleX LaunchPad
            </Link>
            <p>© {new Date().getFullYear()} ScaleX LaunchPad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
