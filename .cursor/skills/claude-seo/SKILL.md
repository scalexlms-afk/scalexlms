---
name: claude-seo
description: >-
  Claude SEO methodology adapted for ScaleX LaunchPad (Cursor). Use when auditing
  or improving SEO, schema, GEO/AI search visibility, sitemaps, robots.txt,
  E-E-A-T, Core Web Vitals (INP), or content for scalexlms.com. Triggers on SEO,
  audit, schema, GEO, AI Overviews, llms.txt, sitemap, E-E-A-T, FBA SEO.
---

# Claude SEO for ScaleX LaunchPad

Adapted from [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) (MIT).
This is a Cursor Agent Skill — not a Claude Code plugin install.

## Site defaults

| Field | Value |
|-------|-------|
| Production URL | `https://www.scalexlms.com` |
| Brand | ScaleX LaunchPad |
| Industry | SaaS + Publisher (course product + blog) |
| Primary keywords | Amazon FBA, private label, ecommerce education, product research, Amazon launch |
| Do not optimize for | Enterprise LMS scalability, generic EdTech infrastructure as primary entity |

## Health score weights

| Category | Weight |
|----------|--------|
| Technical SEO | 22% |
| Content Quality / E-E-A-T | 23% |
| On-Page SEO | 20% |
| Schema / Structured Data | 10% |
| Performance (CWV) | 10% |
| AI Search Readiness (GEO) | 10% |
| Images | 5% |

## Audit workflow

When the user asks for an SEO audit:

1. Detect industry (ScaleX = SaaS + publisher). Skip local/maps unless asked.
2. Check in parallel: technical, content/E-E-A-T, on-page, schema, CWV, GEO, images.
3. Write or update `md/SEO-AUDIT.md` with Critical / High / Medium / Low.
4. Every recommendation must include:
   - First-principle observation
   - Dependency on other fixes
   - Falsifiability: "how would we know this failed?"
   - Leading indicator to monitor

## Hard rules (from Claude SEO)

- Core Web Vitals: use **INP** (never FID). Targets: LCP &lt; 2.5s, INP &lt; 200ms, CLS &lt; 0.1.
- Never recommend HowTo schema (deprecated).
- FAQPage: keep for AI/entity citability; do not sell it as Google rich-results.
- Prefer JSON-LD. Active types for ScaleX: Organization, WebSite, Course, Offer, BlogPosting, Person, BreadcrumbList, FAQPage (AI signal), SoftwareApplication (learning platform only).
- GEO: answer-first (40–60 words), citable passages ~134–167 words, primary-source citations, question-based H2s.
- `llms.txt` is discovery guidance, not a proven ranking lever — report presence, do not over-weight.
- `sameAs` and author credentials must be real URLs only — never invent Wikidata/G2/LinkedIn profiles.
- Public messaging must stay Amazon FBA LaunchPad — do not reintroduce enterprise LMS as the brand.

## AI crawlers (GEO)

**Allow (live retrieval):** OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, ClaudeBot.

**Disallow (training):** Google-Extended, CCBot, anthropic-ai.

Keep private app paths disallowed (`/dashboard`, `/lessons`, `/tasks`, etc.).

## Key codebase paths

- Metadata: `apps/student-portal/src/lib/seo.ts`, `site.ts`, `brand.ts`
- Discovery: `app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/route.ts`
- Schema: `src/lib/structured-data/`
- Blog: `src/lib/blog/`
- Audit log: `md/SEO-AUDIT.md`

## After major SEO work

Verify post-deploy: `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/blog`, Rich Results Test on `/` and one blog post.
