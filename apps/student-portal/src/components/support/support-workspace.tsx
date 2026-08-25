"use client";

import { useState } from "react";
import { SupportHero } from "@/components/support/support-hero";
import { PriorityBanner } from "@/components/support/priority-banner";
import { MentorChatCard } from "@/components/support/mentor-chat-card";
import { CreateTicketCard } from "@/components/support/create-ticket-card";
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog";
import { RecentActivity } from "@/components/support/recent-activity";
import { SupportFooterCta } from "@/components/support/support-footer-cta";
import type { SupportPageData } from "@/lib/support-shared";
import { ContactInfoCard } from "@/components/contact-info-card";

export function SupportWorkspace({
  data,
  createTicketAction,
  flash,
}: {
  data: SupportPageData;
  createTicketAction: (formData: FormData) => Promise<void>;
  flash: { sent?: boolean; error?: string | null };
}) {
  const [ticketOpen, setTicketOpen] = useState(false);

  return (
    <div className="support-theme space-y-6">
      <SupportHero plan={data.plan} />

      {flash.error ? (
        <div className="rounded-2xl border border-scalex-red/40 bg-scalex-red/5 px-4 py-3">
          <p className="text-sm text-scalex-red">{flash.error}</p>
        </div>
      ) : null}
      {flash.sent ? (
        <div className="rounded-2xl border border-accent-green/40 bg-accent-green/5 px-4 py-3">
          <p className="text-sm text-accent-green">
            Ticket submitted
            {data.hasMentor ? " — your mentor has been notified." : "."}
          </p>
        </div>
      ) : null}

      <PriorityBanner premium={data.premium} />

      {data.premium ? (
        <ContactInfoCard
          contact={data.contact}
          title="Premium contact"
          premiumOnly
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <MentorChatCard
          premium={data.premium}
          mentor={data.mentor}
        />
        <CreateTicketCard onCreate={() => setTicketOpen(true)} />
      </div>

      <RecentActivity
        premium={data.premium}
        mentor={data.mentor}
        conversation={data.conversation}
        tickets={data.tickets}
      />

      <SupportFooterCta onContact={() => setTicketOpen(true)} />

      <CreateTicketDialog
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        action={createTicketAction}
      />
    </div>
  );
}
