import { Card } from "@scalex/ui";

const REWARDS = [
  { label: "Badges", color: "bg-accent-gold/15 text-accent-gold" },
  { label: "Certificates", color: "bg-accent-purple/15 text-accent-purple" },
  { label: "Unlock Modules", color: "bg-accent-blue/15 text-accent-blue" },
  { label: "Mentor Access", color: "bg-accent-green/15 text-accent-green" },
] as const;

export function MilestoneRewards() {
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">Milestone Rewards</h2>
      <p className="mt-1 text-sm text-muted">
        What you earn as you complete tasks and milestones
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REWARDS.map((r) => (
          <li
            key={r.label}
            className={`rounded-xl px-3 py-3 text-center text-xs font-semibold ${r.color}`}
          >
            {r.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
