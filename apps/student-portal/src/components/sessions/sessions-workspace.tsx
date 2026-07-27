import { SessionsHero } from "@/components/sessions/sessions-hero";
import { FeaturedSessionCard } from "@/components/sessions/featured-session-card";
import {
  MyBookingsSection,
  UpcomingSessionCards,
} from "@/components/sessions/upcoming-session-cards";
import { RecordingsRow } from "@/components/sessions/recordings-row";
import { SessionsRail } from "@/components/sessions/sessions-rail";
import { SessionsFooterCta } from "@/components/sessions/sessions-footer-cta";
import type { SessionsPageData } from "@/lib/sessions-shared";

export function SessionsWorkspace({ data }: { data: SessionsPageData }) {
  const featured = data.upcoming[0] ?? null;
  const calendarSessions = [
    ...data.upcoming,
    ...data.registeredUpcoming,
  ].filter(
    (session, index, list) =>
      list.findIndex((s) => s.id === session.id) === index
  );

  return (
    <div className="sessions-theme space-y-6">
      <SessionsHero />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <FeaturedSessionCard session={featured} />
          <UpcomingSessionCards sessions={data.upcoming} />
          <MyBookingsSection sessions={data.registeredUpcoming} />
          <RecordingsRow
            recordings={data.recordings}
            watermark={data.watermark}
          />
          <SessionsFooterCta />
        </div>

        <SessionsRail calendarSessions={calendarSessions} />
      </div>
    </div>
  );
}
