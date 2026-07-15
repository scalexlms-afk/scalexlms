import Link from "next/link";
import type { BlogPost } from "@/lib/blog/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function BlogPostContent({ post }: { post: BlogPost }) {
  return (
    <article className="prose-blog mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">{post.category}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{post.answerLead}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>
            By{" "}
            <a
              href={post.author.portfolioUrl}
              rel="author"
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              {post.author.name}
            </a>
            , {post.author.jobTitle}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.updatedAt}>Updated {formatDate(post.updatedAt)}</time>
        </div>
      </header>

      {post.sections.map((section) => (
        <section key={section.heading} className="mb-10">
          {section.level === 2 ? (
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {section.heading}
            </h2>
          ) : (
            <h3 className="font-display text-xl font-semibold text-foreground">
              {section.heading}
            </h3>
          )}
          <p className="mt-4 leading-7 text-muted">{section.content}</p>

          {section.bullets && (
            <ul className="mt-4 list-disc space-y-2 pl-6 text-muted">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {section.table && (
            <figure className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <caption className="mb-2 text-left text-sm font-medium text-foreground">
                  {section.table.caption}
                </caption>
                <thead>
                  <tr className="border-b border-line bg-surface-raised">
                    {section.table.headers.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left font-semibold text-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, i) => (
                    <tr key={i} className="border-b border-line">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-3 text-muted">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </figure>
          )}
        </section>
      ))}

      {post.citations.length > 0 && (
        <section className="mt-12 rounded-xl border border-line bg-surface-raised p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Sources & Citations
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-muted">
            {post.citations.map((c) => (
              <li key={c.url}>
                {c.claim} —{" "}
                <a
                  href={c.url}
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {c.source}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-12 border-t border-line pt-8">
        <p className="text-sm text-muted">
          Next refresh due:{" "}
          <time dateTime={post.nextRefreshDue}>
            {formatDate(post.nextRefreshDue)}
          </time>{" "}
          (90-day quarterly cycle)
        </p>
        <Link
          href="/blog"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          ← All articles
        </Link>
      </footer>
    </article>
  );
}
