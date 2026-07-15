import { siteDescription, siteName, siteTagline, siteUrl } from "./site";

/** Canonical brand entity for structured data and AI citation resolution. */
export const brandEntity = {
  name: "ScaleXLMS",
  legalName: "ScaleX LaunchPad",
  alternateName: siteName,
  url: siteUrl,
  description: siteDescription,
  tagline: siteTagline,
  foundingDate: "2024",
  industry: "EdTech / Learning Management Systems",
  /** sameAs resolves brand ambiguity across knowledge graphs and review platforms. */
  sameAs: [
    "https://www.wikidata.org/wiki/Q131694636",
    "https://www.linkedin.com/company/scalexlms",
    "https://www.g2.com/products/scalexlms",
    "https://www.capterra.com/p/scalexlms",
    "https://twitter.com/scalexlms",
  ],
  contactEmail: "hello@scalexlms.com",
} as const;

export const softwareProduct = {
  name: "ScaleXLMS Platform",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser, iOS, Android",
  softwareRequirements:
    "Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+); minimum 4 Mbps connection; JavaScript enabled",
  featureList: [
    "Auto-scaling infrastructure",
    "Multi-tenant enterprise architecture",
    "AI-assisted mentor evaluation",
    "Milestone-gated learning paths",
    "Real-time progress analytics",
    "Role-based access control (RBAC)",
    "Supabase-backed PostgreSQL data layer",
    "Stripe-integrated billing with split payments",
    "Community forum with moderation",
    "Live session scheduling",
    "Adaptive learning path recommendations",
    "Audit logging for compliance",
  ],
  priceSpecification: {
    currency: "USD",
    plans: [
      { name: "Standard", priceMinor: 99700, billingPeriod: "one-time", description: "Recorded course, AI Mentor, community, templates" },
      { name: "Premium Launch Program", priceMinor: 249700, billingPeriod: "one-time", description: "Everything in Standard plus live classes and mentorship" },
    ],
    paymentSplit: { initialPercent: 70, remainingPercent: 30 },
  },
} as const;
