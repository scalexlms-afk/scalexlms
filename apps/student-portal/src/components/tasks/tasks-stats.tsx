import {
  CheckCircle,
  ClipboardText,
  Clock,
  Hourglass,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import { academyEyebrowMutedClass } from "@/components/academy-cta";
import type { TasksHubStats } from "@/lib/tasks-hub";

export function TasksStats({ stats }: { stats: TasksHubStats }) {
  const items = [
    {
      label: "Pending",
      value: stats.pending,
      iconClass: "bg-accent-amber/15 text-accent-amber",
      icon: <Clock weight="duotone" className="h-5 w-5" />,
    },
    {
      label: "Under Review",
      value: stats.underReview,
      iconClass: "bg-accent-purple/15 text-accent-purple",
      icon: <Hourglass weight="duotone" className="h-5 w-5" />,
    },
    {
      label: "Completed",
      value: stats.completed,
      iconClass: "bg-accent-green/15 text-accent-green",
      icon: <CheckCircle weight="duotone" className="h-5 w-5" />,
    },
    {
      label: "Total Tasks",
      value: stats.total,
      iconClass: "bg-accent-blue/15 text-accent-blue",
      icon: <ClipboardText weight="duotone" className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="!p-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl metallic-edge ${item.iconClass}`}
            >
              {item.icon}
            </span>
            <div>
              <p className={academyEyebrowMutedClass}>{item.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
