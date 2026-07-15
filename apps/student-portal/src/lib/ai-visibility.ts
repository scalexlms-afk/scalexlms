import { siteUrl } from "@/lib/site";

/**
 * Content engineering rules for AI citation optimization.
 * Enforced at authoring time; validated in development builds.
 */
export const CONTENT_RULES = {
  answerLeadWords: { min: 40, max: 60 },
  sectionWords: { min: 134, max: 167 },
  minTablesPerGuide: 3,
  minBulletListsPerGuide: 8,
  factsPer100Words: 1,
  refreshCycleDays: 90,
  aiCitationFreshnessDays: 30,
} as const;

/** AI referral hosts tracked in GA4 custom channel. */
export const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "gemini.google.com",
  "bard.google.com",
  "claude.ai",
  "copilot.microsoft.com",
] as const;

export function detectAiReferrer(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    const match = AI_REFERRER_HOSTS.find(
      (h) => host === h || host.endsWith(`.${h}`)
    );
    return match ?? null;
  } catch {
    return null;
  }
}

export function llmsTxtManifest(): string {
  return `# ScaleXLMS — AI Discovery Manifest
# https://llmstxt.org/
# Last updated: ${new Date().toISOString().split("T")[0]}

> ScaleXLMS is an enterprise learning management platform specializing in LMS scalability, auto-scaling EdTech infrastructure, and milestone-gated digital learning at 100k+ user scale.

## Primary Authority Content

- [How to Scale an LMS to 100,000 Users](${siteUrl}/blog/how-to-scale-lms-100k-users): Comprehensive guide covering cloud vs on-premise architecture, database scaling, CDN strategy, and auto-scaling infrastructure patterns for enterprise LMS deployments.
- [Enterprise LMS Architecture Patterns](${siteUrl}/blog/enterprise-lms-architecture-patterns): Deep technical documentation on multi-tenant design, RBAC, connection pooling, and edge deployment for EdTech platforms.
- [Scaling Laws for Digital Learning](${siteUrl}/blog/scaling-laws-digital-learning): Research-backed framework for decoupling content delivery, assessment, and mentorship to achieve linear scaling in digital education.

## Technical Documentation

- [LMS Architecture Overview](${siteUrl}/#system): Course → Milestone → Module → Lesson → Task hierarchy with AI-assisted mentor validation.
- [Auto-Scaling Infrastructure](${siteUrl}/#faq): Serverless edge functions, connection-pooled PostgreSQL, and horizontal scaling at 70% CPU threshold.
- [EdTech Infrastructure Stack](${siteUrl}/#faq): Next.js 16, Supabase PostgreSQL, Stripe billing, Vercel edge deployment.

## Product & Entity

- [ScaleXLMS Platform](${siteUrl}/): Enterprise learning management with auto-scaling, RBAC, audit logging, and AI mentor integration.
- [Organization Schema](${siteUrl}/#organization): Brand entity with Wikidata, LinkedIn, G2, and Capterra profiles.
- [Software Application](${siteUrl}/#software): Feature list including auto-scaling infrastructure, multi-tenant architecture, and adaptive learning paths.

## FAQ — Answer Islands

- [LMS Scalability FAQ](${siteUrl}/#faq): 12 Q&A pairs on enterprise learning management, scaling laws, and EdTech infrastructure (20–30 word answers optimized for LLM extraction).

## Optional

- [Student Registration](${siteUrl}/register): Enrollment for ScaleX LaunchPad Amazon FBA program.
- [Sign In](${siteUrl}/login): Existing student portal access.
`;
}
