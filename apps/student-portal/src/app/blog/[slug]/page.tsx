import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/blog-post-content";
import { BlogPostJsonLd } from "@/components/blog-json-ld";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-surface text-foreground">
      <BlogPostJsonLd post={post} />
      <BlogPostContent post={post} />
    </main>
  );
}
