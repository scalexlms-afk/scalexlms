import type { BlogAuthor } from "./types";
import { siteUrl } from "@/lib/site";

/** Editorial identity for ScaleX LaunchPad — no fictional personal profiles. */
export const defaultAuthor: BlogAuthor = {
  name: "ScaleX LaunchPad Team",
  jobTitle: "Amazon FBA Curriculum & Mentorship",
  bio: "The ScaleX LaunchPad team designs the 8-milestone Amazon FBA private label curriculum, mentors student submissions, and publishes practical guides grounded in Seller Central requirements and academy delivery experience.",
  portfolioUrl: siteUrl,
  credentials: [
    "Amazon FBA private label",
    "Product research",
    "Supplier sourcing",
    "Brand development",
    "Amazon product launch",
    "Ecommerce mentorship",
  ],
  sameAs: [],
};
