import type { BlogPost } from "../types";
import { defaultAuthor } from "../authors";

export const fbaLaunchChecklistPost: BlogPost = {
  slug: "amazon-fba-launch-checklist",
  title: "Amazon FBA Launch Checklist",
  description:
    "A practical Amazon FBA launch checklist covering listing readiness, inventory, PPC, compliance, and post-launch monitoring before you spend on traffic.",
  answerLead:
    "A controlled Amazon FBA launch needs a complete listing, inbound inventory plan, fee-aware pricing, and a PPC budget with daily checks—not a hope that organic ranking appears overnight. Use this checklist to confirm compliance, images, backend terms, and FBA shipment readiness before ads. ScaleX LaunchPad’s Launch milestone treats the checklist as a mentor-approved deliverable so capital and ad spend follow preparation.",
  category: "Amazon Launch",
  keywords: [
    "Amazon FBA launch",
    "Amazon listing checklist",
    "FBA PPC launch",
    "Amazon seller launch",
    "private label launch",
  ],
  publishedAt: "2026-06-01T08:00:00Z",
  updatedAt: "2026-07-19T10:00:00Z",
  nextRefreshDue: "2026-10-17T10:00:00Z",
  author: defaultAuthor,
  citations: [
    {
      claim: "Listing content and product detail requirements are defined by Amazon",
      source: "Amazon Seller Central Help — Product detail pages",
      url: "https://sellercentral.amazon.com/help/hub/reference/G200332540",
    },
    {
      claim: "FBA shipment and inventory prep rules are Amazon-controlled",
      source: "Amazon Seller Central — Fulfillment by Amazon",
      url: "https://sell.amazon.com/fulfillment-by-amazon",
    },
    {
      claim: "Advertising policies govern launch PPC",
      source: "Amazon Ads policies",
      url: "https://advertising.amazon.com/resources/ad-policy",
    },
  ],
  sections: [
    {
      heading: "Listing Readiness Before Any Ad Spend",
      level: 2,
      content:
        "Launch fails when traffic hits an incomplete listing. Confirm title structure, bullet clarity, description or A+ eligibility, main image on white background, and secondary images that show use and scale. Amazon’s product detail guidance is the standard—not social media aesthetics alone. Backend search terms should cover synonyms without stuffing. Price must clear your fee model from the hunting sheet. If Brand Registry is available, ensure brand approval paths for A+ are understood before promising premium content in ads. Do not schedule PPC until the detail page is live and accurate.",
      bullets: [
        "Main image meets Amazon image rules",
        "Bullets state benefits with honest claims",
        "Price matches unit economics model",
        "Category and browse nodes correct",
        "Backend terms filled without brand spam",
        "Variation family correct if applicable",
        "A+ plan noted if Brand Registry active",
        "Mobile preview checked for truncation",
      ],
    },
    {
      heading: "Inventory and FBA Inbound Checklist",
      level: 2,
      content:
        "Ads without inventory convert curiosity into stranded spend. Create the FBA shipment plan, confirm prep and labeling requirements, and verify quantities match launch forecast plus buffer. Amazon’s FBA documentation covers labeling, prep, and delivery windows—follow it precisely to avoid receiving delays. Track shipment status daily during the launch week. For first launches, prefer a smaller initial inbound that still covers expected PPC-driven sales for several weeks rather than over-ordering unproven demand. Coordinate supplier lead times before you promise delivery dates in any launch campaign.",
      table: {
        caption: "Inbound readiness",
        headers: ["Item", "Owner", "Done when"],
        rows: [
          ["FBA shipment created", "Seller", "Shipment ID active"],
          ["Labels / prep correct", "Seller / partner", "Matches FBA requirements"],
          ["Units vs forecast", "Seller", "Covers launch window + buffer"],
          ["Receiving monitored", "Seller", "Units available for sale"],
        ],
      },
    },
    {
      heading: "Compliance and Account Health Gates",
      level: 2,
      content:
        "A launch is not “creative”—it is a compliance event. Confirm the product is allowed in the category, that any required approvals are complete, and that packaging claims match reality. Account health metrics matter before and after launch; policy warnings during a PPC push can erase momentum. Keep invoices and supplier contacts organized for authenticity requests. If you sell in regulated niches, re-read Amazon’s category requirements the week of launch. ScaleX mentors treat missing compliance notes on the launch checklist as automatic revision required.",
      bullets: [
        "Category approvals complete",
        "No unresolved account health issues",
        "Claims match product and lab docs if needed",
        "Packaging and inserts reviewed",
        "Invoices ready for authenticity checks",
        "Safety / warning labels present if required",
        "IP clearance revisited vs final design",
        "Return / defect handling plan written",
      ],
    },
    {
      heading: "PPC and Launch Traffic Plan",
      level: 2,
      content:
        "Paid traffic should validate conversion, not hide a weak offer. Start with tightly themed exact and phrase campaigns around core keywords, daily budgets you can afford to lose while learning, and clear bid caps. Amazon Ads policies constrain creative and claims—stay inside them. Measure conversion rate and ACOS daily in week one; pause wasteful terms rather than scaling spend. Organic rank may move slowly; that is expected. Document the plan on the checklist: daily budget, match types, negative keyword process, and the kill criteria if conversion stays below your model.",
      table: {
        caption: "Launch PPC controls",
        headers: ["Control", "Week-1 default", "Escalate when"],
        rows: [
          ["Daily budget", "Capped test budget", "CVR meets model 3+ days"],
          ["Match types", "Exact / phrase first", "Query data justifies broad"],
          ["Negatives", "Daily harvest", "Search term report shows waste"],
          ["Kill rule", "Pre-written ACOS/CVR", "Triggered without emotion"],
        ],
      },
    },
    {
      heading: "Customer Experience on Day Zero",
      level: 2,
      content:
        "Early reviews and defect rates shape the listing’s future. Ensure inserts explain use without prohibited review solicitation language. Monitor buyer messages and feedback daily during launch. Prepare a defect response path with your supplier. Amazon’s performance and customer experience expectations are non-negotiable; a beautiful listing with high defect rates still fails. Premium ScaleX students often use live mentor calls in this window to unblock listing or inventory issues quickly—Standard students should use tickets and community with the same checklist discipline.",
      bullets: [
        "Insert card compliant and useful",
        "Buyer messages monitored daily",
        "Feedback and reviews watched without solicitation abuse",
        "Defect / replacement path agreed with supplier",
        "Listing errors fixed within 24 hours",
        "Stock alerts set before stockout",
        "Launch notes logged for Scaling milestone",
        "Next-week budget review scheduled",
      ],
    },
    {
      heading: "Post-Launch Review Into the Scaling Milestone",
      level: 2,
      content:
        "After two to four weeks of clean data, review what the checklist predicted versus reality: conversion rate, ACOS, inbound timing, and top search terms. That review becomes the input to ScaleX’s Scaling milestone—not random tactic hopping. Keep the launch checklist versioned with dates so quarterly refreshes stay honest. Primary sources remain Amazon’s fee, FBA, and ads documentation when policies change. If conversion failed, fix the offer before scaling spend. If conversion worked but inventory lagged, fix supply chain before raising budgets.",
      table: {
        caption: "Launch retrospective",
        headers: ["Metric", "Source", "Decision"],
        rows: [
          ["Unit session percentage", "Business Reports", "Listing vs offer fix"],
          ["ACOS / TACOS", "Ads console", "Scale, cut, or restructure"],
          ["Stock cover days", "Inventory", "Reorder or pause ads"],
          ["Defect / return rate", "Account health", "Quality hold if high"],
        ],
      },
    },
  ],
};
