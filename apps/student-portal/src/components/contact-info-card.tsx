"use client";

import { EnvelopeSimple, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { Card } from "@scalex/ui";
import type { PublicContactInfo } from "@/lib/contact-settings-shared";
import { hasAnyContact } from "@/lib/contact-settings-shared";

export function ContactInfoCard({
  contact,
  title = "Contact ScaleX",
  premiumOnly = false,
}: {
  contact: PublicContactInfo;
  title?: string;
  premiumOnly?: boolean;
}) {
  if (!hasAnyContact(contact)) return null;

  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {premiumOnly ? (
        <p className="mt-1 text-sm text-muted">
          Priority contact details for premium students.
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">
          Reach the ScaleX team using the details below.
        </p>
      )}
      <ul className="mt-4 space-y-2 text-sm">
        {contact.email ? (
          <li className="flex items-center gap-2">
            <EnvelopeSimple className="h-4 w-4 text-muted" aria-hidden />
            <a href={`mailto:${contact.email}`} className="text-scalex-red hover:underline">
              {contact.email}
            </a>
          </li>
        ) : null}
        {contact.phone ? (
          <li className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted" aria-hidden />
            <a href={`tel:${contact.phone}`} className="text-foreground hover:underline">
              {contact.phone}
            </a>
          </li>
        ) : null}
        {contact.whatsapp ? (
          <li className="flex items-center gap-2">
            <WhatsappLogo className="h-4 w-4 text-muted" aria-hidden />
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[^\d+]/g, "")}`}
              className="text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {contact.whatsapp}
            </a>
          </li>
        ) : null}
      </ul>
    </Card>
  );
}
