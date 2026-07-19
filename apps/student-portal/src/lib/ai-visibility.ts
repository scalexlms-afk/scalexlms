import { siteUrl } from "@/lib/site";

/**
 * Content engineering rules for AI citation optimization.
 * Enforced at authoring time for FBA authority guides.
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
  return `# ScaleX LaunchPad — AI Discovery Manifest
# https://llmstxt.org/
# Last updated: ${new Date().toISOString().split("T")[0]}

> ScaleX LaunchPad is an AI-powered Amazon FBA private label academy. Students follow an 8-milestone roadmap from beginner to launched seller with mentor-validated tasks, AI mentorship, and measurable progress.

## Primary Authority Content

- [Amazon FBA Private Label Beginner's Guide](${siteUrl}/blog/amazon-fba-private-label-beginners-guide): What private label FBA is, how it differs from wholesale/retail arbitrage, and the execution path from research to first sale.
- [Product Research for Winning Amazon Products](${siteUrl}/blog/product-research-winning-amazon-products): Demand, competition, and profit filters for product hunting sheets that mentors can approve.
- [Amazon FBA Launch Checklist](${siteUrl}/blog/amazon-fba-launch-checklist): Pre-launch listing, PPC, inventory, and compliance checklist for a controlled Amazon launch.

## Program Documentation

- [The ScaleX System](${siteUrl}/#system): Course → Milestone → Module → Lesson → Task hierarchy with AI-assisted prep and human mentor approval.
- [8-Milestone Roadmap](${siteUrl}/#roadmap): Foundation through Scaling, each with a concrete deliverable.
- [Plans](${siteUrl}/#plans): Standard vs Premium Launch Program comparison.

## Product & Entity

- [ScaleX LaunchPad](${siteUrl}/): Amazon FBA private label education with AI Mentor, community, and mentor validation.
- [Amazon FBA FAQ](${siteUrl}/#faq): Short Q&A answer islands on private label, milestones, payments, and mentorship.

## Optional

- [Student Registration](${siteUrl}/register): Enroll in ScaleX LaunchPad.
- [Sign In](${siteUrl}/login): Existing student portal access.
`;
}
