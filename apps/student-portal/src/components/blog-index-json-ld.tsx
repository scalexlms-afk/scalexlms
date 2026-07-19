import { buildBlogIndexSchema } from "@/lib/structured-data/blog";
import type { BlogPost } from "@/lib/blog/types";

export function BlogIndexJsonLd({ posts }: { posts: BlogPost[] }) {
  const structuredData = buildBlogIndexSchema(posts);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
