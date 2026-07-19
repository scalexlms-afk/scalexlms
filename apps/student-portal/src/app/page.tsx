import type { Metadata } from "next";
import localFont from "next/font/local";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  Compass,
  GraduationCap,
  ShieldCheck,
  Sparkle,
  Target,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { Button, Logo, ThemeToggle } from "@scalex/ui";
import { LandingJsonLd } from "@/components/landing-json-ld";
import { LandingFaq } from "@/components/landing-faq";
import { LandingMotion } from "@/components/landing-motion";
import { MentorFeedbackCarousel } from "@/components/mentor-feedback-carousel";
import { pageMetadata } from "@/lib/seo";
import { defaultTitle, siteDescription, siteUrl } from "@/lib/site";

const cabinet = localFont({
  src: [
    { path: "../fonts/cabinet-400.woff2", weight: "400" },
    { path: "../fonts/cabinet-500.woff2", weight: "500" },
    { path: "../fonts/cabinet-700.woff2", weight: "700" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMetadata({
    title: "ScaleX LaunchPad",
    description: siteDescription,
    path: "/",
  }),
  title: { absolute: defaultTitle },
  openGraph: {
    title: defaultTitle,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteDescription,
  },
};

const learningModes = [
  {
    icon: BookOpen,
    title: "A curriculum with an outcome",
    body: "Every lesson points toward a task, and every task moves your brand forward.",
    image: "/landing/pillar-research.png",
  },
  {
    icon: Brain,
    title: "AI help that knows the course",
    body: "Ask questions at any hour and get answers grounded in ScaleX academy content.",
    image: "/landing/pillar-ai.png",
  },
  {
    icon: UsersThree,
    title: "Mentors who make the final call",
    body: "Milestone-gating work advances only after your assigned mentor approves it.",
    image: "/landing/hero-product.png",
  },
  {
    icon: Target,
    title: "Progress you can act on",
    body: "See your current stage, completion, and next action without digging through menus.",
    image: "/landing/pillar-research.png",
  },
];

const chapters = [
  {
    title: "Build the foundation",
    milestones: ["Foundation", "Business Setup"],
    deliverables: ["Business Plan", "Documents Upload"],
    image: "/landing/pillar-research.png",
  },
  {
    title: "Find the opportunity",
    milestones: ["Brand Research", "Product Hunting"],
    deliverables: ["Brand Direction", "Product Hunting Sheet"],
    image: "/landing/hero-product.png",
  },
  {
    title: "Create the brand",
    milestones: ["Sourcing", "Brand Development"],
    deliverables: ["Supplier Finalization", "Brand Assets"],
    image: "/landing/pillar-ai.png",
  },
  {
    title: "Launch and scale",
    milestones: ["Launch", "Scaling"],
    deliverables: ["Launch Checklist", "Scale Strategy"],
    image: "/landing/hero-product.png",
  },
];

const marquee = [
  "Research",
  "Validate",
  "Source",
  "Build",
  "Launch",
  "Scale",
];

export default function HomePage() {
  return (
    <main
      className={`${cabinet.className} w-full max-w-full overflow-x-hidden bg-surface text-foreground`}
    >
      <LandingJsonLd />
      <LandingMotion>
        <div className="fixed inset-x-0 top-4 z-40 px-4">
          <header className="glass-strong metallic-edge mx-auto flex h-16 max-w-5xl items-center justify-between rounded-full border border-line px-4 shadow-[0_14px_50px_-28px_rgba(0,0,0,0.75)] sm:px-6">
            <Link href="/" aria-label="ScaleX LaunchPad home">
              <Logo size="sm" />
            </Link>
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-7 text-sm font-medium text-muted md:flex"
            >
              <a href="#system" className="transition-colors hover:text-foreground">
                The system
              </a>
              <a href="#roadmap" className="transition-colors hover:text-foreground">
                Roadmap
              </a>
              <a href="#plans" className="transition-colors hover:text-foreground">
                Plans
              </a>
              <Link href="/blog" className="transition-colors hover:text-foreground">
                Blog
              </Link>
              <a href="#faq" className="transition-colors hover:text-foreground">
                FAQ
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" prefetch={false} className="hidden sm:block">
                <Button variant="tertiary" className="whitespace-nowrap">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" prefetch={false}>
                <Button className="whitespace-nowrap !rounded-full !px-5">
                  Start now
                </Button>
              </Link>
            </div>
          </header>
        </div>

        <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-scalex-black px-4 pb-16 pt-28 text-white sm:px-6">
          <Image
            src="/landing/hero-product.png"
            alt="Private-label product packaging ready for launch"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(11,11,16,0.12),rgba(11,11,16,0.92)_72%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-scalex-black/45 via-transparent to-scalex-black" />

          <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
            <p
              data-hero
              className="text-sm font-medium uppercase tracking-[0.18em] text-red-300"
            >
              Amazon FBA private label, built step by step
            </p>
            <h1
              data-hero
              className="mt-7 max-w-6xl text-[clamp(2.15rem,6.5vw,6.25rem)] font-bold leading-[0.88] tracking-[-0.055em]"
            >
              Turn what you learn into
              <span className="block text-scalex-red">a brand you can launch.</span>
            </h1>
            <p
              data-hero
              className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl"
            >
              Curriculum, AI guidance, mentor validation, and a visible roadmap
              in one execution system.
            </p>
            <div
              data-hero
              className="mt-9 flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row"
            >
              <Link href="/register" prefetch={false} className="sm:flex-1">
                <Button className="w-full whitespace-nowrap !rounded-full !py-3.5 text-base">
                  Start now
                  <ArrowRight weight="bold" className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" prefetch={false} className="sm:flex-1">
                <Button
                  variant="secondary"
                  className="w-full whitespace-nowrap !rounded-full !border-white/20 !bg-white/10 !py-3.5 text-base !text-white backdrop-blur-md hover:!bg-white/20"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="system" className="mx-auto max-w-7xl px-4 py-32 sm:px-6 md:py-48 lg:px-8">
          <div className="mb-14 max-w-3xl">
            <h2 className="text-4xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl">
              More than a course library.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              ScaleX connects learning, execution, feedback, and progress so
              students keep moving toward a real launch.
            </p>
          </div>

          <div className="grid grid-flow-dense gap-3 md:grid-cols-4 md:grid-rows-2">
            <article className="group relative min-h-[520px] overflow-hidden rounded-[var(--radius-card)] md:col-span-2 md:row-span-2">
              <Image
                data-scale-media
                src="/landing/pillar-ai.png"
                alt="Abstract visual representing the ScaleX AI mentor"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
                <Sparkle weight="fill" className="h-8 w-8 text-scalex-red" />
                <h3 className="mt-5 text-3xl font-bold tracking-[-0.03em]">
                  Intelligence that stays in context.
                </h3>
                <p className="mt-3 max-w-md leading-relaxed text-white/70">
                  The AI Mentor starts with academy knowledge, then helps you
                  apply it to the work in front of you.
                </p>
              </div>
            </article>

            <article className="metallic-graphite metallic-edge flex min-h-[252px] flex-col justify-between rounded-[var(--radius-card)] border border-line p-7 md:col-span-2">
              <GraduationCap weight="duotone" className="h-9 w-9 text-scalex-red" />
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.025em]">
                  Learn by completing.
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">
                  Every milestone has a concrete deliverable. Watching a lesson
                  alone never counts as completion.
                </p>
              </div>
            </article>

            <article className="flex min-h-[252px] flex-col justify-between rounded-[var(--radius-card)] border border-scalex-red/30 bg-scalex-red/[0.07] p-7 md:col-span-2">
              <ShieldCheck weight="duotone" className="h-9 w-9 text-scalex-red" />
              <div>
                <h3 className="text-2xl font-bold tracking-[-0.025em]">
                  AI assists. Humans approve.
                </h3>
                <p className="mt-3 max-w-lg leading-relaxed text-muted">
                  AI can annotate and pre-score. A mentor owns the final
                  approval on work that unlocks your next milestone.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="border-y border-line py-32 md:py-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="max-w-4xl text-4xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl">
              Support changes shape as your business takes shape.
            </h2>
            <div className="mt-16 flex flex-col gap-3 md:h-[560px] md:flex-row">
              {learningModes.map((mode) => (
                <article
                  key={mode.title}
                  className="group relative min-h-[260px] flex-1 overflow-hidden rounded-[var(--radius-card)] border border-line transition-[flex] duration-700 ease-out md:min-h-0 md:hover:flex-[1.8]"
                >
                  <Image
                    src={mode.image}
                    alt={mode.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 35vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <mode.icon weight="duotone" className="h-7 w-7 text-red-300" />
                    <h3 className="mt-4 text-2xl font-bold leading-tight">
                      {mode.title}
                    </h3>
                    <p className="mt-3 max-w-sm leading-relaxed text-white/70 md:translate-y-3 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      {mode.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-b border-line py-7" aria-label="ScaleX learning journey">
          <div className="flex w-max animate-[marquee_24s_linear_infinite] motion-reduce:animate-none">
            {[...marquee, ...marquee].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center text-3xl font-bold tracking-[-0.03em] text-muted sm:text-5xl"
              >
                {item}
                <span aria-hidden="true" className="mx-8 h-2 w-2 rounded-full bg-scalex-red sm:mx-12" />
              </span>
            ))}
          </div>
        </div>

        <section id="roadmap" className="mx-auto max-w-7xl px-4 py-32 sm:px-6 md:py-48 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="lg:sticky lg:top-32">
              <Compass weight="duotone" className="h-10 w-10 text-scalex-red" />
              <h2 className="mt-7 text-4xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl">
                Eight milestones. Four decisive chapters.
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                Move from foundation to scale with a deliverable and mentor
                checkpoint at every stage.
              </p>
            </div>

            <div className="space-y-8">
              {chapters.map((chapter, index) => (
                <article
                  data-stack-card
                  key={chapter.title}
                  style={{ zIndex: index + 1 }}
                  className="metallic-graphite metallic-edge relative min-h-[620px] overflow-hidden rounded-[var(--radius-card)] border border-line p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] sm:p-7"
                >
                  <div className="group relative h-[330px] overflow-hidden rounded-[calc(var(--radius-card)-4px)]">
                    <Image
                      data-scale-media
                      src={chapter.image}
                      alt={`${chapter.title} — Amazon FBA roadmap chapter`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                  </div>
                  <div className="grid gap-8 px-2 pb-4 pt-8 sm:grid-cols-[0.7fr_1.3fr] sm:px-4">
                    <div>
                      <h3 className="text-3xl font-bold tracking-[-0.035em]">
                        {chapter.title}
                      </h3>
                    </div>
                    <div className="space-y-5">
                      {chapter.milestones.map((milestone, milestoneIndex) => (
                        <div key={milestone} className="flex items-start gap-4">
                          <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-scalex-red text-xs font-bold text-white">
                            {index * 2 + milestoneIndex + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{milestone}</p>
                            <p className="mt-1 text-sm text-muted">
                              {chapter.deliverables[milestoneIndex]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface-2 py-32 md:py-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MentorFeedbackCarousel />
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-7xl px-4 py-32 sm:px-6 md:py-48 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-4xl font-bold leading-[0.95] tracking-[-0.045em] sm:text-6xl">
              Choose the support behind your launch.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            <Plan
              name="Standard"
              description="A self-paced execution path with AI support and community access."
              features={[
                "Recorded curriculum",
                "AI Mentor access",
                "Templates and task sheets",
                "Community and support tickets",
              ]}
              href="/register?plan=standard"
            />
            <Plan
              name="Premium Launch Program"
              description="The complete program with live mentorship and hands-on launch support."
              features={[
                "Everything in Standard",
                "Live classes and workshops",
                "Private mentor calls",
                "Priority review and launch support",
              ]}
              featured
              href="/register?plan=premium"
            />
          </div>
        </section>

        <section id="guides" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Amazon FBA guides
            </h2>
            <p className="mt-4 text-muted">
              Free practical reading that mirrors the LaunchPad milestones —
              then enroll when you are ready to submit real work.
            </p>
            <ul className="mt-8 space-y-3 text-left text-sm sm:text-base">
              <li>
                <Link
                  href="/blog/amazon-fba-private-label-beginners-guide"
                  className="font-medium text-accent hover:underline"
                >
                  Amazon FBA Private Label: A Beginner&apos;s Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/product-research-winning-amazon-products"
                  className="font-medium text-accent hover:underline"
                >
                  Product Research for Winning Amazon Products
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/amazon-fba-launch-checklist"
                  className="font-medium text-accent hover:underline"
                >
                  Amazon FBA Launch Checklist
                </Link>
              </li>
            </ul>
            <Link
              href="/blog"
              className="mt-8 inline-block text-sm font-medium text-muted hover:text-foreground"
            >
              View all guides →
            </Link>
          </div>
        </section>

        <LandingFaq />

        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="metallic-red relative mx-auto flex min-h-[70dvh] max-w-7xl items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-white/15 px-6 py-24 text-center text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_48%)]" />
            <div className="relative">
              <h2 className="mx-auto max-w-5xl text-[clamp(3rem,7vw,7rem)] font-bold leading-[0.86] tracking-[-0.06em]">
                Your first milestone starts here.
              </h2>
              <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/80">
                Build the skills, submit the work, and launch with a system
                designed to keep you moving.
              </p>
              <Link href="/register" prefetch={false} className="mt-10 inline-block">
                <Button
                  variant="secondary"
                  className="whitespace-nowrap !rounded-full !bg-white !px-8 !py-4 text-base !text-scalex-black hover:!bg-white/90"
                >
                  Start now
                  <ArrowRight weight="bold" className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
          <Logo size="md" showTagline />
          <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted">
            <a href="#system" className="hover:text-foreground">
              The system
            </a>
            <a href="#roadmap" className="hover:text-foreground">
              Roadmap
            </a>
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link href="/login" prefetch={false} className="hover:text-foreground">
              Sign in
            </Link>
            <span className="text-subtle">
              &copy; {new Date().getFullYear()} ScaleX LaunchPad
            </span>
          </div>
        </footer>
      </LandingMotion>
    </main>
  );
}

function Plan({
  name,
  description,
  features,
  featured = false,
  href,
}: {
  name: string;
  description: string;
  features: string[];
  featured?: boolean;
  href: string;
}) {
  return (
    <article
      className={`flex min-h-[480px] flex-col rounded-[var(--radius-card)] border p-7 sm:p-10 ${
        featured
          ? "metallic-red border-white/15 text-white shadow-glow-red"
          : "glass metallic-edge border-line"
      }`}
    >
      <h3 className="text-3xl font-bold tracking-[-0.035em]">{name}</h3>
      <p className={`mt-4 max-w-md leading-relaxed ${featured ? "text-white/75" : "text-muted"}`}>
        {description}
      </p>
      <ul className="mt-10 flex-1 space-y-4">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <span
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                featured ? "bg-white/15" : "bg-scalex-red/10"
              }`}
            >
              <Check
                weight="bold"
                className={`h-3.5 w-3.5 ${featured ? "text-white" : "text-scalex-red"}`}
              />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={href} prefetch={false} className="mt-10">
        <Button
          variant={featured ? "secondary" : "primary"}
          className={`w-full whitespace-nowrap !rounded-full !py-3.5 ${
            featured ? "!border-white/20 !bg-white/15 !text-white hover:!bg-white/25" : ""
          }`}
        >
          Start now
        </Button>
      </Link>
    </article>
  );
}
