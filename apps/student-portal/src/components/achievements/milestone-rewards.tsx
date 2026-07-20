import {
  Certificate,
  Medal,
  SquaresFour,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";

const REWARDS = [
  {
    label: "Badges",
    color: "bg-accent-gold/15 text-accent-gold",
    icon: Medal,
  },
  {
    label: "Certificates",
    color: "bg-accent-purple/15 text-accent-purple",
    icon: Certificate,
  },
  {
    label: "Unlock Modules",
    color: "bg-accent-blue/15 text-accent-blue",
    icon: SquaresFour,
  },
  {
    label: "Mentor Access",
    color: "bg-accent-green/15 text-accent-green",
    icon: UserCircle,
  },
] as const;

export function MilestoneRewards() {
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">Milestone Rewards</h2>
      <p className="mt-1 text-sm text-muted">
        What you earn as you complete tasks and milestones
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REWARDS.map((r) => {
          const Icon = r.icon;
          return (
            <li
              key={r.label}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-center text-xs font-semibold metallic-edge ${r.color}`}
            >
              <Icon weight="duotone" className="h-5 w-5" aria-hidden />
              {r.label}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
