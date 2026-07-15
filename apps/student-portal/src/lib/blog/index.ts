import type { BlogPost } from "./types";
import { enterpriseArchitecturePost } from "./posts/enterprise-architecture";
import { scaleLms100kPost } from "./posts/scale-lms-100k";
import { scalingLawsPost } from "./posts/scaling-laws";

const allPosts: BlogPost[] = [
  scaleLms100kPost,
  enterpriseArchitecturePost,
  scalingLawsPost,
];

export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return allPosts.map((p) => p.slug);
}
