import { buildBlogPostSchema } from "@/lib/structured-data/blog";
import type { BlogPost } from "@/lib/blog/types";

export function BlogPostJsonLd({ post }: { post: BlogPost }) {
  const structuredData = buildBlogPostSchema(post);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
