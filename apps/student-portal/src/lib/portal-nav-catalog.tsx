"use client";

import type { NavGroup } from "@scalex/ui";
import {
  Bell,
  ChatCircle,
  CheckSquare,
  CreditCard,
  Gear,
  Lifebuoy,
  MapTrifold,
  PlayCircle,
  Robot,
  SignOut,
  SquaresFour,
  Trophy,
  UsersThree,
  VideoCamera,
} from "@phosphor-icons/react";

const navIcon = "h-4 w-4";

export function buildPortalNavGroups(unreadCount = 0): NavGroup[] {
  return [
    {
      title: "Academy",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <SquaresFour weight="duotone" className={navIcon} />,
        },
        {
          label: "Continue Learning",
          href: "/continue-learning",
          icon: <PlayCircle weight="duotone" className={navIcon} />,
          emphasis: "primary" as const,
        },
        {
          label: "Roadmap",
          href: "/roadmap",
          icon: <MapTrifold weight="duotone" className={navIcon} />,
        },
        {
          label: "Lessons",
          href: "/lessons",
          icon: <PlayCircle weight="duotone" className={navIcon} />,
        },
        {
          label: "Tasks",
          href: "/tasks",
          icon: <CheckSquare weight="duotone" className={navIcon} />,
        },
        {
          label: "Achievements",
          href: "/achievements",
          icon: <Trophy weight="duotone" className={navIcon} />,
        },
      ],
    },
    {
      title: "Connect",
      items: [
        {
          label: "AI Mentor",
          href: "/ai-mentor",
          icon: <Robot weight="duotone" className={navIcon} />,
          pillBadge: { label: "AI", tone: "ai" as const },
        },
        {
          label: "Community",
          href: "/community",
          icon: <UsersThree weight="duotone" className={navIcon} />,
        },
        {
          label: "Live Classes",
          href: "/sessions",
          icon: <VideoCamera weight="duotone" className={navIcon} />,
        },
        {
          label: "Mentor Chat",
          href: "/messages",
          icon: <ChatCircle weight="duotone" className={navIcon} />,
        },
        {
          label: "Support",
          href: "/support",
          icon: <Lifebuoy weight="duotone" className={navIcon} />,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          label: "Notifications",
          href: "/notifications",
          icon: <Bell weight="duotone" className={navIcon} />,
          badge: unreadCount || undefined,
        },
        {
          label: "Settings",
          href: "/settings",
          icon: <Gear weight="duotone" className={navIcon} />,
        },
        {
          label: "Billing",
          href: "/billing",
          icon: <CreditCard weight="duotone" className={navIcon} />,
        },
        {
          label: "Sign out",
          href: "/auth/signout",
          icon: <SignOut weight="bold" className={navIcon} />,
          kind: "action" as const,
          action: "/auth/signout",
        },
      ],
    },
  ];
}

export function portalNavHrefs(groups: NavGroup[]): string[] {
  return groups.flatMap((group) =>
    group.items
      .filter((item) => item.kind !== "action" && item.href)
      .map((item) => item.href)
  );
}
