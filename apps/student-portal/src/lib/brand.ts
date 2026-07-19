import { siteDescription, siteName, siteTagline, siteUrl } from "./site";

/** Canonical brand entity for structured data and AI citation resolution. */
export const brandEntity = {
  name: "ScaleX LaunchPad",
  legalName: "ScaleX LaunchPad",
  alternateName: "ScaleX",
  url: siteUrl,
  description: siteDescription,
  tagline: siteTagline,
  foundingDate: "2024",
  industry: "Ecommerce education / Amazon FBA",
  /**
   * sameAs resolves brand ambiguity. Only include profiles that exist —
   * never invent Wikidata/G2/Capterra URLs.
   */
  sameAs: [] as readonly string[],
  contactEmail: "hello@scalexlms.com",
  logoPath: "/scalex-logo-transparent.png",
} as const;

export const softwareProduct = {
  name: "ScaleX LaunchPad",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)",
  softwareRequirements:
    "Modern browser with JavaScript enabled; minimum 4 Mbps connection; account enrollment via Stripe Checkout",
  featureList: [
    "8-milestone Amazon FBA private label roadmap",
    "AI Mentor grounded in academy content",
    "Human mentor approval on milestone-gating tasks",
    "Task submission with images, PDF, Excel, links, and text",
    "Real-time progress dashboards",
    "Community forum for cohort support",
    "Live sessions for Premium Launch Program",
    "Stripe billing with configurable 70/30 payment split",
    "Templates and product hunting sheets",
    "Gamified levels and milestone badges",
  ],
  priceSpecification: {
    currency: "USD",
    plans: [
      {
        name: "Standard",
        priceMinor: 99700,
        billingPeriod: "one-time",
        description:
          "Recorded Amazon FBA curriculum, AI Mentor, community, templates, and support tickets",
      },
      {
        name: "Premium Launch Program",
        priceMinor: 249700,
        billingPeriod: "one-time",
        description:
          "Everything in Standard plus live classes, private mentor calls, and launch support",
      },
    ],
    paymentSplit: { initialPercent: 70, remainingPercent: 30 },
  },
} as const;

export const brandKnowsAbout = [
  "Amazon FBA",
  "Amazon private label",
  "Product research",
  "Supplier sourcing",
  "Brand development",
  "Amazon product launch",
  "Ecommerce education",
] as const;
