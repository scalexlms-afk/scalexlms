import { brandEntity } from "@/lib/brand";
import type { BlogAuthor, BlogPost } from "@/lib/blog/types";
import { siteUrl } from "@/lib/site";

type SchemaNode = Record<string, unknown>;

const logoUrl = `${siteUrl}${brandEntity.logoPath}`;

export function buildAuthorSchema(author: BlogAuthor): SchemaNode {
  const person: SchemaNode = {
    "@type": "Person",
    "@id": `${author.portfolioUrl}#person`,
    name: author.name,
    jobTitle: author.jobTitle,
    description: author.bio,
    url: author.portfolioUrl,
    knowsAbout: author.credentials,
    worksFor: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: brandEntity.name,
      url: brandEntity.url,
    },
  };
  if (author.sameAs.length > 0) {
    person.sameAs = author.sameAs;
  }
  return person;
}

export function buildBlogPostSchema(post: BlogPost): {
  "@context": string;
  "@graph": SchemaNode[];
} {
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const author = buildAuthorSchema(post.author);
  const authorId = author["@id"] as string;

  const publisher: SchemaNode = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: brandEntity.name,
    url: brandEntity.url,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
  };

  const breadcrumb: SchemaNode = {
    "@type": "BreadcrumbList",
    "@id": `${postUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  const article: SchemaNode = {
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@id": authorId },
    publisher,
    image: [`${siteUrl}/opengraph-image`],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    inLanguage: "en-US",
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [author, publisher, breadcrumb, article],
  };
}

export function buildBlogIndexSchema(posts: BlogPost[]): {
  "@context": string;
  "@graph": SchemaNode[];
} {
  const blogUrl = `${siteUrl}/blog`;

  const collection: SchemaNode = {
    "@type": "CollectionPage",
    "@id": `${blogUrl}#collection`,
    name: "Amazon FBA Guides — ScaleX LaunchPad Blog",
    description:
      "Practical Amazon FBA private label guides on product research, launch checklists, and beginner systems.",
    url: blogUrl,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  const breadcrumb: SchemaNode = {
    "@type": "BreadcrumbList",
    "@id": `${blogUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: blogUrl,
      },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [collection, breadcrumb],
  };
}
