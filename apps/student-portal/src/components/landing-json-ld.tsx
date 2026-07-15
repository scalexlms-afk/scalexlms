import { buildLandingSchemaGraph } from "@/lib/structured-data/landing";

export function LandingJsonLd() {
  const structuredData = buildLandingSchemaGraph();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
