"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  ChartLineUp,
  House,
  MagnifyingGlass,
  Megaphone,
  Question,
  Trophy,
  Truck,
} from "@phosphor-icons/react";
import {
  COMMUNITY_CHANNELS,
  type CommunityChannel,
} from "@/lib/data";

const CHANNEL_ICONS: Record<
  CommunityChannel | "latest",
  ComponentType<{ className?: string; weight?: "duotone" | "fill" | "bold" }>
> = {
  latest: House,
  announcements: Megaphone,
  product_hunting: MagnifyingGlass,
  supplier_help: Truck,
  ppc_discussion: ChartLineUp,
  questions: Question,
  student_wins: Trophy,
};

export function ChannelChips({
  activeChannel,
}: {
  activeChannel: CommunityChannel | "latest";
}) {
  const chips: { key: CommunityChannel | "latest"; label: string }[] = [
    { key: "latest", label: "All Feed" },
    ...COMMUNITY_CHANNELS,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((channel) => {
        const active = activeChannel === channel.key;
        const Icon = CHANNEL_ICONS[channel.key];
        return (
          <Link
            key={channel.key}
            href={`/community?channel=${channel.key}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-accent-purple text-white shadow-[0_10px_24px_-14px_rgba(139,92,246,0.95)]"
                : "bg-surface-2 text-muted hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            <Icon
              weight={active ? "fill" : "duotone"}
              className="h-3.5 w-3.5"
              aria-hidden
            />
            {channel.label}
          </Link>
        );
      })}
    </div>
  );
}
