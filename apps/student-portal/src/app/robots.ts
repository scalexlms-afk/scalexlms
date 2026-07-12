import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/register"],
        disallow: [
          "/dashboard",
          "/roadmap",
          "/lessons",
          "/tasks",
          "/community",
          "/sessions",
          "/ai-mentor",
          "/payment",
          "/api",
          "/unauthorized",
          "/auth",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
