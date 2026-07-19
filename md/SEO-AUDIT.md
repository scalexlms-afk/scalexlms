# SEO Audit — ScaleX LaunchPad

**Date:** 2026-07-19  
**URL:** https://www.scalexlms.com  
**Method:** Claude SEO (Cursor-adapted) — SaaS + Publisher  
**Primary focus:** Amazon FBA / private label education (not enterprise LMS)

## Health score (pre-fix estimate)

| Category | Weight | Score | Notes |
|----------|--------|------:|-------|
| Technical SEO | 22% | 72 | robots/sitemap/llms exist; auth pages in sitemap; support/messages noindex missing |
| Content / E-E-A-T | 23% | 35 | Entity mismatch LMS vs FBA; fictional author; fake sameAs |
| On-Page SEO | 20% | 55 | Solid landing; FAQ/blog pitched wrong topic |
| Schema | 10% | 50 | Graph present; missing logo, breadcrumbs, images |
| Performance (CWV) | 10% | 70 | next/font + lazy GA + INP reporter |
| AI Search (GEO) | 10% | 40 | llms/blog optimized for LMS keywords |
| Images | 5% | 60 | OG routes exist; metadata images not explicit |
| **Weighted** | | **~52** | Critical entity fix required |

## Critical

1. **Entity mismatch (LMS vs FBA)**  
   - Observation: `site.ts` is FBA; brand/blog/FAQ/llms.txt pitch ScaleXLMS enterprise LMS.  
   - Dependency: Blocks all topical authority for Amazon FBA queries.  
   - Fail check: Rich Results / AI snippets cite “LMS scalability” for scalexlms.com.  
   - Leading indicator: GSC impressions for “Amazon FBA” vs “LMS scalability”.  
   - Status: **Fixed in this pass** (brand, FAQ, blog, llms.txt, keywords).

2. **Fake sameAs / fictional author**  
   - Observation: Invented Wikidata/G2/Capterra + Arjun Mehta weaken Trust.  
   - Fail check: sameAs 404 or Person credentials unverifiable.  
   - Status: **Fixed** — real-or-omit sameAs; ScaleX LaunchPad Team author.

## High

3. **Sitemap promotes thin auth URLs** — remove `/login`/`/register` from sitemap. **Fixed.**  
4. **Schema gaps** — Organization logo, BlogPosting image, BreadcrumbList, Course offers. **Fixed.**  
5. **support/messages noindex** — add layouts + robots disallow. **Fixed.**  
6. **Landing FAQ / blog copy** — FBA answer islands + 3 FBA pillars. **Fixed.**

## Medium

7. Explicit OG/Twitter images in `seo.ts`. **Fixed.**  
8. Blog CollectionPage / ItemList JSON-LD. **Fixed.**  
9. Internal links landing ↔ blog ↔ register. **Fixed.**  
10. FAQPage kept for AI citability only (not Google FAQ rich results). **Noted.**

## Low

11. Off-site: Reddit/YouTube/Wikipedia brand mentions (out of scope).  
12. GSC OAuth / Claude SEO Google API tier (out of scope).  
13. Quarterly content refresh calendar (tracked via `nextRefreshDue` on posts).

## Action plan shipped

- [x] Cursor skill `.cursor/skills/claude-seo/SKILL.md`
- [x] Realign brand + metadata + llms.txt to FBA
- [x] Replace LMS blog with FBA authority cluster
- [x] Technical: robots, sitemap, schema, noindex
- [x] Post-deploy verification checklist (below)

## Post-deploy verification

1. `https://www.scalexlms.com/robots.txt` — search bots allowed; training bots blocked; `/support`/`/messages` disallowed  
2. `https://www.scalexlms.com/sitemap.xml` — `/`, `/blog`, three FBA posts only (no login/register)  
3. `https://www.scalexlms.com/llms.txt` — FBA academy language, FBA blog URLs  
4. `https://www.scalexlms.com/blog` — three FBA guides, no LMS titles  
5. Google Rich Results Test on `/` — Organization + Course (no LMS-as-primary entity)  
6. Rich Results Test on one blog post — BlogPosting + Person + BreadcrumbList  
7. 30-day leading indicator: GSC query mix shifts toward Amazon FBA terms

## Falsifiability summary

| Fix | How we know it failed |
|-----|------------------------|
| FBA entity realign | AI/search still summarizes site as enterprise LMS |
| Sitemap cleanup | Auth pages appear as top indexed URLs in GSC |
| Schema logo/breadcrumb | Rich Results warnings for missing recommended fields |
| noindex support/messages | Those URLs appear in Google index |
