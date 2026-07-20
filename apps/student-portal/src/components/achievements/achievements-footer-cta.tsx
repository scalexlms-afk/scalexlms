import { Star } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { AcademyCtaLink } from "@/components/academy-cta";

export function AchievementsFooterCta({ href }: { href: string }) {
  return (
    <Card className="border-scalex-red/20 bg-gradient-to-r from-scalex-red/10 via-surface-2 to-surface-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-purple/20 text-accent-purple metallic-edge"
            aria-hidden
          >
            <Star weight="fill" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              Consistency Pays Off!
            </p>
            <p className="mt-1 text-sm text-muted">
              Keep completing tasks and achieving milestones.
            </p>
          </div>
        </div>
        <AcademyCtaLink href={href}>Continue Learning →</AcademyCtaLink>
      </div>
    </Card>
  );
}
