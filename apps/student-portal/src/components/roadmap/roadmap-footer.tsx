import { Star } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { AcademyCtaLink } from "@/components/academy-cta";

export function RoadmapFooter() {
  return (
    <Card className="!py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-accent-gold" aria-hidden>
            <Star weight="fill" className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium text-foreground">
            Stay Consistent, See Results
          </p>
        </div>
        <AcademyCtaLink href="/dashboard" variant="secondary" className="!py-2">
          View My Progress
        </AcademyCtaLink>
      </div>
    </Card>
  );
}
