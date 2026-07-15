import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const PRIVATE_PATHS = [
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
];

const PUBLIC_PATHS = ["/", "/login", "/register", "/blog"];

/** Training scrapers — disallow to protect proprietary EdTech insights. */
const TRAINING_BOTS = ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai"];

/** Live-retrieval bots — allow for AI search citation. */
const SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Claude-SearchBot",
  "ClaudeBot",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [];

  for (const bot of TRAINING_BOTS) {
    rules.push({ userAgent: bot, disallow: ["/"] });
  }

  for (const bot of SEARCH_BOTS) {
    rules.push({
      userAgent: bot,
      allow: PUBLIC_PATHS,
      disallow: PRIVATE_PATHS,
    });
  }

  rules.push({
    userAgent: "*",
    allow: PUBLIC_PATHS,
    disallow: PRIVATE_PATHS,
  });

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
