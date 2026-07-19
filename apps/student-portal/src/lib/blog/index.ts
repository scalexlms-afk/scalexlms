import type { BlogPost } from "./types";
import { fbaBeginnersGuidePost } from "./posts/fba-beginners-guide";
import { fbaLaunchChecklistPost } from "./posts/fba-launch-checklist";
import { productResearchPost } from "./posts/product-research";

const allPosts: BlogPost[] = [
  fbaBeginnersGuidePost,
  productResearchPost,
  fbaLaunchChecklistPost,
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
