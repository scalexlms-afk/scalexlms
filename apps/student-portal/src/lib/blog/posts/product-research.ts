import type { BlogPost } from "../types";
import { defaultAuthor } from "../authors";

export const productResearchPost: BlogPost = {
  slug: "product-research-winning-amazon-products",
  title: "Product Research for Winning Amazon Products",
  description:
    "A practical Amazon product research framework covering demand, competition, and profit filters so your hunting sheet survives mentor review.",
  answerLead:
    "Winning Amazon product research combines three filters: real demand, beatable competition, and profit after Amazon fees and ads. A mentor-ready hunting sheet documents those filters with sources—not vibes. ScaleX LaunchPad’s Product Hunting milestone requires that sheet before sourcing, so you do not lock suppliers on a product that fails unit economics or faces entrenched brands.",
  category: "Product Research",
  keywords: [
    "Amazon product research",
    "product hunting",
    "Amazon FBA",
    "competition analysis",
    "profit calculator FBA",
  ],
  publishedAt: "2026-05-01T08:00:00Z",
  updatedAt: "2026-07-19T10:00:00Z",
  nextRefreshDue: "2026-10-17T10:00:00Z",
  author: defaultAuthor,
  citations: [
    {
      claim: "Amazon fee schedules are authoritative for profit models",
      source: "Amazon Seller Central — Selling on Amazon fees",
      url: "https://sell.amazon.com/pricing",
    },
    {
      claim: "Product listing and category policies constrain what you can sell",
      source: "Amazon Seller Central Help — Categories and products",
      url: "https://sellercentral.amazon.com/help/hub/reference/G200333160",
    },
    {
      claim: "Ecommerce retail remains a measured Census series",
      source: "U.S. Census Bureau Monthly Retail Trade",
      url: "https://www.census.gov/retail/index.html",
    },
  ],
  sections: [
    {
      heading: "Why Product Research Is a Milestone, Not a Guess",
      level: 2,
      content:
        "Most failed private label attempts skip written research. Sellers order samples from a trending TikTok niche, then discover FBA fees, review walls, or restricted status after money is spent. Amazon’s category and product policies are the compliance baseline; fee pages are the profit baseline. Treat research as a decision record: what demand signal you saw, which ASINs you compared, and what margin remains at a realistic sale price. ScaleX requires a Product Hunting Sheet so mentors can approve or send revisions before the Sourcing milestone opens.",
      bullets: [
        "Write demand, competition, and profit on one sheet",
        "Check category restrictions before loving a niche",
        "Use Amazon fee tools, not memory",
        "Compare at least five competing ASINs",
        "Note review counts and rating floors",
        "Estimate CPC and launch ad burn",
        "Kill products that fail any hard filter",
        "Keep sources linked for mentor review",
      ],
    },
    {
      heading: "Demand Filters That Survive Scrutiny",
      level: 2,
      content:
        "Demand means customers already search and buy in the niche—not that a product looks cool. Practical signals include stable search interest, multiple offers with sales history indicators, and complementary keywords that map to a clear use case. Census ecommerce aggregates do not prove your niche; they only confirm the channel’s scale. Inside a niche, prefer problems with recurring use or clear upgrade paths over one-time novelty. Document why demand is durable: seasonal spikes need inventory planning; fad spikes need a kill switch. If you cannot explain the customer job-to-be-done in one sentence, demand is not clear enough to source.",
      table: {
        caption: "Demand signal checklist",
        headers: ["Signal", "Healthy pattern", "Red flag"],
        rows: [
          ["Search intent", "Clear use case keywords", "Vague or novelty-only terms"],
          ["Offer density", "Multiple active sellers", "One dominant brand only"],
          ["Seasonality", "Planned inventory curve", "Ignored holiday cliffs"],
          ["Repeat potential", "Consumable / accessory", "Pure one-time gimmick"],
        ],
      },
    },
    {
      heading: "Competition Analysis Without Vanity Metrics",
      level: 2,
      content:
        "Competition analysis asks whether a new private label can earn visibility and reviews without absurd ad spend. Look at the top results’ review counts, rating quality, content depth (A+ / video), and price clustering. A niche with several mid-tier sellers and review gaps is often healthier than a wall of 10,000-review incumbents. Also scan for IP risk—branded characters, patented designs, or lookalike packaging. Amazon Brand Registry and IP complaint processes make copying dangerous. Your hunting sheet should name the ASIN you believe you can beat and the specific gap: price band, bundle, quality, or content—not “I will outwork them.”",
      bullets: [
        "List top 5–10 ASINs with review counts",
        "Note average price and main image quality",
        "Flag brands with strong A+ and storefronts",
        "Identify review themes you can improve",
        "Avoid trademark-adjacent naming",
        "Skip niches dominated by one mega-brand",
        "Record launch CPC assumptions",
        "State your differentiation in one line",
      ],
    },
    {
      heading: "Profit Filters After Real Amazon Fees",
      level: 2,
      content:
        "Profit is contribution margin after landed cost, referral fees, FBA fees, storage expectations, returns allowance, and advertising. Amazon’s published pricing and FBA resources are the primary sources for fee inputs. Beginners often undercount dimensional weight or storage on slow movers. Build three scenarios: base, pessimistic CPC, and delayed organic. If only the optimistic case works, the product fails the filter. ScaleX mentors reject sheets that show retail price without a fee breakdown. Remember: a “winning” product that cannot clear fees at a competitive price is not winning—it is inventory risk.",
      table: {
        caption: "Profit model inputs",
        headers: ["Input", "Primary source", "Buffer tip"],
        rows: [
          ["Landed cost", "Supplier + freight quote", "Add sample variance %"],
          ["Referral + FBA", "Amazon fee / FBA tools", "Re-check size tier"],
          ["Ad cost / unit", "Launch PPC plan", "Stress-test higher CPC"],
          ["Returns / misc", "Category norms", "Do not assume 0%"],
        ],
      },
    },
    {
      heading: "Building a Mentor-Ready Product Hunting Sheet",
      level: 2,
      content:
        "A hunting sheet is a decision document, not a collage of screenshots. Include product name working title, target customer, demand notes, competition table, unit economics, compliance notes, and a go/no-go recommendation. Attach links to Seller Central fee pages or category help articles you relied on. When ScaleX mentors review, they look for coherent logic and risk honesty—especially IP, restricted categories, and margin fragility. AI can help format the sheet; it cannot own the capital decision. If revision is required, update the same sheet rather than starting a new product each week.",
      bullets: [
        "One primary candidate per sheet submission",
        "Competition table with named ASINs",
        "Full fee-aware unit economics",
        "Compliance / restriction notes",
        "Differentiation statement",
        "Go / revise / kill recommendation",
        "Links to primary sources used",
        "Version date for quarterly refresh",
      ],
    },
    {
      heading: "From Approved Sheet to Sourcing Without Skipping Gates",
      level: 2,
      content:
        "Approval means you may contact suppliers—not that you should wire a full container. Request samples, verify quality against listing claims you plan to make, and confirm packaging constraints for FBA prep. Recompute landed cost with real sample shipping. Amazon listing rules still apply: claims, images, and product detail must be accurate. Only after samples and revised economics should you finalize a supplier. That is why ScaleX separates Product Hunting from Sourcing as distinct milestones with distinct deliverables.",
      table: {
        caption: "Hunting → sourcing handoff",
        headers: ["Step", "Owner", "Exit criteria"],
        rows: [
          ["Hunting sheet approved", "Mentor", "Written go decision"],
          ["Samples ordered", "Student", "Quality vs claims checked"],
          ["Landed cost revised", "Student", "Margins still pass"],
          ["Supplier finalized", "Student + mentor", "Sourcing milestone task"],
        ],
      },
    },
  ],
};
