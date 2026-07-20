import Link from "next/link";
import { Card } from "@scalex/ui";

export function RoadmapFooter() {
  return (
    <Card className="!py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-accent-amber" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2.5 14.2 8.2 20 9.1 15.7 13.2 16.9 19 12 16.2 7.1 19l1.2-5.8L4 9.1l5.8-.9L12 2.5Z" />
            </svg>
          </span>
          <p className="text-sm font-medium text-foreground">
            Stay Consistent, See Results
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl border border-line px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-3"
        >
          View My Progress
        </Link>
      </div>
    </Card>
  );
}
