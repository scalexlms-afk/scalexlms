import { siteDescription, siteName, siteTagline, siteUrl } from "@/lib/site";

export function LandingJsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        slogan: siteTagline,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "Course",
        "@id": `${siteUrl}/#course`,
        name: "Amazon FBA Private Label — ScaleX LaunchPad",
        description:
          "An execution-focused Amazon FBA private label program with 8 milestones: Foundation, Business Setup, Brand Research, Product Hunting, Sourcing, Brand Development, Launch, and Scaling.",
        provider: { "@id": `${siteUrl}/#organization` },
        educationalLevel: "Beginner to Advanced",
        teaches: [
          "Amazon FBA private label",
          "Product research",
          "Supplier sourcing",
          "Brand development",
          "Amazon product launch",
        ],
        url: siteUrl,
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
