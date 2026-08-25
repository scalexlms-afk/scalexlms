import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  FileText,
  Robot,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { Card } from "@scalex/ui";
import type { ContinueResource } from "@/lib/continue-learning";
import type { CommunityPost } from "@/lib/data";

export function SidePanels({
  resources,
  aiPrompts,
  communityPosts,
}: {
  resources: ContinueResource[];
  aiPrompts: string[];
  communityPosts: CommunityPost[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card>
        <PanelTitle icon={FileText}>Resources</PanelTitle>
        {resources.length === 0 ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted">
              No PDF/link resources in this stage yet.
            </p>
            <Link
              href="/roadmap"
              className="text-sm font-semibold text-scalex-red hover:underline"
            >
              Browse roadmap →
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {resources.slice(0, 6).map((resource) => (
              <li key={resource.id}>
                <Link
                  href={resource.href}
                  {...(resource.downloadable
                    ? { download: true }
                    : {})}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-1 py-1 transition-colors hover:border-line hover:bg-surface-3/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-[10px] font-bold uppercase text-muted">
                    {resource.typeLabel.slice(0, 4)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {resource.title}
                    </span>
                    <span className="text-xs text-subtle">
                      {resource.typeLabel}
                      {resource.downloadable ? " · Download" : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <PanelTitle icon={Robot}>AI Mentor</PanelTitle>
        <p className="mt-1 text-sm text-muted">Suggested questions for this stage</p>
        <ul className="mt-4 space-y-2">
          {aiPrompts.map((prompt) => (
            <li key={prompt}>
              <Link
                href={`/ai-mentor?q=${encodeURIComponent(prompt)}`}
                className="block rounded-xl border border-line bg-surface-3/40 px-3 py-2.5 text-sm text-foreground transition-colors hover:border-scalex-red/40 hover:bg-scalex-red/5"
              >
                {prompt}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/ai-mentor"
          className="mt-4 inline-flex text-sm font-semibold text-scalex-red hover:underline"
        >
          Open AI Chat →
        </Link>
      </Card>

      <Card>
        <PanelTitle icon={UsersThree}>Community Help</PanelTitle>
        <p className="mt-1 text-sm text-muted">Recent questions from students</p>
        {communityPosts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No questions yet. Be the first to ask.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {communityPosts.map((post) => (
              <li key={post.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                <Link href={`/community/${post.id}`} className="block hover:opacity-90">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {post.content}
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    {post.profiles?.name ?? "Student"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/community?channel=questions"
          className="mt-4 inline-flex text-sm font-semibold text-scalex-red hover:underline"
        >
          Ask in Community →
        </Link>
      </Card>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  children,
}: {
  icon: Icon;
  children: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-scalex-red/10 text-scalex-red metallic-edge">
        <Icon weight="duotone" className="h-4 w-4" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold">{children}</h2>
    </div>
  );
}
