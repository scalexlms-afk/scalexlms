import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowClass } from "@/components/academy-cta";
import { AcademyIllustration } from "@/components/academy-illustration";

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
        <h2 className="font-display text-lg font-semibold text-accent-gold">
          Why This Matters
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{whyThisMatters}</p>
        <div className="mt-5 rounded-xl border border-line bg-surface-3/50 p-4 metallic-edge">
          <p className={academyEyebrowClass}>Completing this step unlocks</p>
          <div className="mt-2 flex items-center gap-2">
            <ArrowRight
              weight="bold"
              className="h-4 w-4 text-scalex-red"
              aria-hidden
            />
            <p className="font-semibold text-foreground">{unlocksLabel}</p>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-accent-green">
            What You&apos;ll Learn
          </h2>
          <AcademyIllustration
            src="/illustrations/target-arrow.png"
            size={72}
          />
        </div>
        {learnItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Lessons for this stage will appear here once content is published.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {learnItems.slice(0, 6).map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check
                  weight="bold"
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-green"
                />
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
