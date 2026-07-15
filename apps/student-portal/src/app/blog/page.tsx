import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@scalex/ui";
import { getAllPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "LMS Scalability & EdTech Infrastructure Blog",
  description:
    "Technical guides on scaling learning management systems to 100k users, enterprise LMS architecture, and scaling laws for digital learning.",
  path: "/blog",
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-surface text-foreground">
      <header className="border-b border-line px-4 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" aria-label="ScaleXLMS home">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted hover:text-foreground"
          >
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          LMS Scalability & EdTech Infrastructure
        </h1>
        <p className="mt-4 text-lg text-muted">
          Authoritative technical guides on enterprise learning management,
          auto-scaling infrastructure, and scaling laws for digital learning.
        </p>

        <div className="mt-12 space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-line bg-surface-raised p-6 transition-colors hover:border-accent/30"
            >
              <p className="text-sm font-medium text-accent">{post.category}</p>
              <h2 className="mt-2 font-display text-xl font-semibold">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-accent"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted">{post.answerLead}</p>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted">
                <span>{post.author.name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.updatedAt}>
                  Updated {formatDate(post.updatedAt)}
                </time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
