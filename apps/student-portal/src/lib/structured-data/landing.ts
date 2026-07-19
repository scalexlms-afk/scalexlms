import { brandEntity, brandKnowsAbout, softwareProduct } from "@/lib/brand";
import { landingFaqItems } from "@/lib/structured-data/faq";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

type SchemaNode = Record<string, unknown>;

export function buildLandingSchemaGraph(): {
  "@context": string;
  "@graph": SchemaNode[];
} {
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const softwareId = `${siteUrl}/#software`;
  const faqId = `${siteUrl}/#faq`;
  const courseId = `${siteUrl}/#course`;
  const logoUrl = `${siteUrl}${brandEntity.logoPath}`;

  const organization: SchemaNode = {
    "@type": "Organization",
    "@id": orgId,
    name: brandEntity.name,
    legalName: brandEntity.legalName,
    alternateName: brandEntity.alternateName,
    url: brandEntity.url,
    description: brandEntity.description,
    slogan: brandEntity.tagline,
    foundingDate: brandEntity.foundingDate,
    email: brandEntity.contactEmail,
    knowsAbout: [...brandKnowsAbout],
    logo: {
      "@type": "ImageObject",
      "@id": `${siteUrl}/#logo`,
      url: logoUrl,
      contentUrl: logoUrl,
      caption: brandEntity.name,
    },
    image: logoUrl,
    ...(brandEntity.sameAs.length > 0 ? { sameAs: [...brandEntity.sameAs] } : {}),
  };

  const website: SchemaNode = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: siteName,
    description: siteDescription,
    publisher: { "@id": orgId },
    inLanguage: "en-US",
  };

  const courseOffers = softwareProduct.priceSpecification.plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: (plan.priceMinor / 100).toFixed(2),
    priceCurrency: softwareProduct.priceSpecification.currency,
    description: plan.description,
    url: `${siteUrl}/register`,
    availability: "https://schema.org/InStock",
  }));

  const software: SchemaNode = {
    "@type": "SoftwareApplication",
    "@id": softwareId,
    name: softwareProduct.name,
    applicationCategory: softwareProduct.applicationCategory,
    operatingSystem: softwareProduct.operatingSystem,
    softwareRequirements: softwareProduct.softwareRequirements,
    featureList: softwareProduct.featureList.join(", "),
    description:
      "Learning platform for ScaleX LaunchPad — Amazon FBA private label academy with AI Mentor, mentor-validated tasks, and an 8-milestone roadmap.",
    offers: courseOffers,
    provider: { "@id": orgId },
    url: siteUrl,
  };

  const faq: SchemaNode = {
    "@type": "FAQPage",
    "@id": faqId,
    mainEntity: landingFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const course: SchemaNode = {
    "@type": "Course",
    "@id": courseId,
    name: "Amazon FBA Private Label — ScaleX LaunchPad",
    description:
      "An execution-focused Amazon FBA private label program with 8 milestones: Foundation, Business Setup, Brand Research, Product Hunting, Sourcing, Brand Development, Launch, and Scaling.",
    provider: { "@id": orgId },
    educationalLevel: "Beginner to Advanced",
    teaches: [
      "Amazon FBA private label",
      "Product research",
      "Supplier sourcing",
      "Brand development",
      "Amazon product launch",
    ],
    offers: courseOffers,
    url: siteUrl,
    inLanguage: "en-US",
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, course, software, faq],
  };
}
