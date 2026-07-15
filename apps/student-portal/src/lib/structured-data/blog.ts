import { brandEntity } from "@/lib/brand";
import type { BlogAuthor, BlogPost } from "@/lib/blog/types";
import { siteUrl } from "@/lib/site";

type SchemaNode = Record<string, unknown>;

export function buildAuthorSchema(author: BlogAuthor): SchemaNode {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${author.portfolioUrl}#person`,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    url: author.portfolioUrl,
    sameAs: author.sameAs,
    knowsAbout: author.credentials,
    worksFor: {
      "@type": "Organization",
      name: brandEntity.name,
      url: brandEntity.url,
    },
  };
}

export function buildBlogPostSchema(post: BlogPost): {
  "@context": string;
  "@graph": SchemaNode[];
} {
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const author = buildAuthorSchema(post.author);

  const article: SchemaNode = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@id": author["@id"] },
    publisher: {
      "@type": "Organization",
      name: brandEntity.name,
      url: brandEntity.url,
    },
    mainEntityOfPage: postUrl,
    url: postUrl,
    inLanguage: "en-US",
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [author, article],
  };
}
