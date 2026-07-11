# AGENTS.md — ScaleX LaunchPad

> Instructions for AI coding agents (Claude Code, Cursor, or any autonomous
> contributor) working in this repository. Read this file first, every
> session, before touching code.

## 1. What This Project Is

ScaleX LaunchPad is an AI-powered ecommerce education and business-launch
ecosystem that takes a student from "beginner" to "Amazon FBA Private Label
brand owner." It is not a passive course library — it is an execution system
built on four pillars: structured curriculum, AI mentorship, human mentor
validation, and measurable business progress.

Tagline: **Learn. Build. Launch. Grow.**

Two portals share one backend:

- **Student Portal — "ScaleX LaunchPad"**: learning journey, AI mentor,
  community, task submission, progress tracking.
- **Admin Portal — "ScaleX Management OS"**: academy management, CRM,
  finance, content control, student intelligence.

Both sit on top of a shared **AI Intelligence Layer** and a single **Data
Layer**. Treat the system as one product with two front-ends, not two
separate products.

## 2. Product Principles (do not violate these when building features)

1. **Execution over consumption.** Every lesson ladders up to a Task that
   must be submitted and reviewed. Don't design flows that let a student
   "complete" a milestone without a submission + approval step.
2. **AI assists, humans approve.** The AI Mentor answers questions and
   pre-scores submissions; final approval on a milestone-gating task belongs
   to a Mentor. Never let AI silently auto-approve a gating task.
3. **Progress must be visible everywhere.** Dashboards (student and admin)
   are the product's spine — stage, percentage, and next action should
   always be one glance away.
4. **Role-based access is not optional.** Every new screen or endpoint must
   be checked against `ROLES.md` before it ships.
5. **One learning hierarchy.** `Course → Milestone → Module → Lesson → Task`.
   Do not introduce a parallel content structure.

## 3. Architecture Overview

```
        [Student Portal]  <---->  [ScaleX AI Engine]  <---->  [Admin Portal]
                \                        |                         /
                 \_______________ [Core Platform Services] ________/
                                         |
                                 [Data Layer / Database]
                                         |
                              [External Integrations]
```

**Student Portal modules:** Dashboard & Progress, Learning Roadmap
(Milestones), Task Submission, AI Mentor Chat, Live Sessions, Community,
Support Tickets, Certificates.

**Admin Portal modules:** Dashboard & Analytics, Student Management, Course &
Content Management, Task & Review Center, Live Sessions Management, CRM &
Lead Management, Finance & Billing, AI Intelligence Dashboard, System
Settings & Roles.

**AI Intelligence Layer** (shared — not owned by either portal):

| Capability | What it does |
|---|---|
| AI Mentor & Q&A | Answers student questions — 80% grounded in ScaleX's own academy content, 20% general ecommerce knowledge |
| Assignment Evaluation | Pre-scores / annotates task submissions before human mentor review |
| Adaptive Learning Path | Flags a student's weak areas and resequences recommended content |
| Analytics & Insights | Feeds the Admin AI Intelligence Dashboard (inactive students, weak performance, payment risk) |
| Automations & Alerts | Triggers reminders / follow-ups from AI-detected signals |

**Core Platform Services** (shared infrastructure both portals depend on):
Authentication & Authorization, Role & Permission Management, Notification
Service, Workflow Automation, Search & Filtering, Audit Logs & Activity
Tracking, Billing & Subscription, API Gateway, Data Sync & Webhooks.

**External integrations** (suggested providers — none are locked in; confirm
with the team before wiring a real one):

| Purpose | Suggested providers |
|---|---|
| Payments | Stripe, PayPal |
| Transactional email | SendGrid, Resend |
| SMS / WhatsApp | Twilio, 360dialog |
| Video hosting | Vimeo, Bunny Stream |
| File storage | S3-compatible object storage |
| Calendar / live sessions | Google Calendar, Zoom, Google Meet |
| AI / LLM | OpenAI, Anthropic Claude, or a custom fine-tuned model |
| Product analytics | GA4, Mixpanel |
| Marketing | Meta Ads, Google Ads |
| Accounting | QuickBooks, Zoho Books |
| Monitoring / backup | any standard APM + automated backup provider |

## 4. Tech Stack (proposed — confirm before assuming)

No stack was mandated in the source spec beyond "Web Application + Future
Mobile App" and a BaaS-style data layer. Unless a `package.json` / lockfile
already in this repo says otherwise, assume the following and flag any
conflict to a human before proceeding:

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Same Next.js app via route handlers/server actions, or a
  dedicated Node/TypeScript service if the codebase already splits it out
- **Database:** PostgreSQL via an ORM (Prisma or Drizzle) — see `SCHEMA.md`
- **Auth:** Session or JWT-based auth carrying a role claim
  (`super_admin | instructor | mentor | sales | student`)
- **AI layer:** Server-side calls to an LLM provider only — never expose
  model API keys client-side
- **Mobile (Phase 4):** React Native or Flutter against the same backend —
  do not fork business logic into a separate implementation

**If this repository already contains a different stack, that repo wins** —
this section is a fallback for greenfield work only.

## 5. Repository Structure (target shape)

```
/apps
  /student-portal        # ScaleX LaunchPad web app
  /admin-portal           # ScaleX Management OS web app
  /mobile                 # Phase 4 — React Native / Flutter
/packages
  /ui                      # shared design-system components (see DESIGN.md)
  /api-client              # typed client for the shared backend
  /config                  # shared eslint / tsconfig / tailwind config
/services
  /api                     # core backend — auth, RBAC, CRUD, workflow
  /ai-engine               # AI Mentor, evaluation, insights
/docs
  AGENTS.md
  DESIGN.md
  PLAN.md
  SCHEMA.md
  ROLES.md
```

Adjust to match whatever actually exists in this repo — this is a target,
not a mandate to restructure a working codebase without discussion.

## 6. Roles & Permissions

Five roles: **Super Admin, Instructor, Mentor, Sales, Student**. The full
module-by-module matrix lives in `ROLES.md`. Rules of thumb:

- Students only ever see their **own** data (own progress, own submissions)
  — never another student's.
- Mentors see only their **assigned** students, not the full roster.
- Sales owns CRM / Leads / Enrollment and has no access to course content or
  finance beyond the leads they manage.
- Finance and System Settings are **Super Admin only**.
- Every admin action must be logged (Audit Logs & Activity Tracking) — this
  is a stated product requirement, not a nice-to-have.

## 7. Core Domain Concepts

**Learning hierarchy:** `Course → Milestone → Module → Lesson → Task`
Example — Course "Amazon FBA Private Label" → Milestone "Product Research" →
Module "Finding Winning Products" → Lessons ("Demand Analysis", "Competition
Research", "Profit Calculation") → Task "Upload Product Sheet".

**Task lifecycle** (implement as an explicit state machine, not free text):
`Not Started → Submitted → Under Review → Approved | Revision Required`
Submissions accept images, Excel, PDF, links, and text. Review is AI-assisted
and mentor-approved.

**Student journey (top-level funnel):**
`Registration Payment → Account Activation → Welcome Dashboard → Learning
Roadmap → Milestones → Tasks → Mentor Approval → Product Launch → Brand
Scaling`

**The 8 milestones** (each is its own card in the roadmap UI):

| # | Milestone | Task deliverable |
|---|---|---|
| 1 | Foundation | Business Plan |
| 2 | Business Setup | Documents Upload |
| 3 | Brand Research | Brand Direction |
| 4 | Product Hunting | Product Hunting Sheet |
| 5 | Sourcing | Supplier Finalization |
| 6 | Brand Development | Brand Assets |
| 7 | Launch | Launch Checklist |
| 8 | Scaling | Scale Strategy |

**CRM pipeline (Sales-owned):**
`New Lead → Contacted → Interested → Demo → Payment Pending → Enrolled`

**Payment rule:** 70% due on first payment, 30% remaining — implement as a
configurable rule, not a hardcoded split, since plans/pricing will evolve.

**Gamification:** 4 student levels (Beginner Seller → Research Expert →
Brand Builder → Amazon Launcher) plus milestone badges (Product Found,
Supplier Selected, First Sale, …). Badge logic should be event-driven off
milestone/task completion, not manually assigned.

**Plans:** Standard (recorded course, AI Mentor, community, templates,
support tickets) vs. Premium Launch Program (everything in Standard + live
classes, live mentorship, private calls, launch support).

## 8. Coding Conventions

- TypeScript everywhere; no implicit `any`.
- Shared components live in `packages/ui`; app-local components stay
  app-local.
- All dates/times stored in UTC; format at the presentation edge.
- Money stored as integer minor units (cents), never floats.
- Every new API route or server action must check role/permission before
  touching data — assume nothing about the caller.
- Feature-flag anything not yet in the current `PLAN.md` phase so unfinished
  work can ship dark.

## 9. Commands

Placeholder until a real toolchain exists in-repo. Once `package.json`
scripts are defined, mirror them here, e.g.:

```bash
pnpm install       # install all workspace dependencies
pnpm dev           # run all apps locally (student :3000, admin :3001)
pnpm build         # build all apps/packages
pnpm lint          # lint all packages
pnpm typecheck     # typecheck all packages
```

Migrations are applied via the **Supabase MCP** (`apply_migration`) — SQL files live in `supabase/migrations/`. Regenerate DB types with `generate_typescript_types` MCP tool into `packages/db/src/database.types.ts`.

Do not invent commands that don't exist — check `package.json` first and
update this section whenever scripts change.

## 10. Working Agreements for AI Agents

- Read `DESIGN.md` before writing any UI — do not invent a new color
  palette or component style.
- Read `SCHEMA.md` before creating a new database table/entity — check
  whether it already exists under a different name.
- Read `ROLES.md` before adding any screen, route, or button — every UI
  affordance must map to a permitted role.
- When implementing a `PLAN.md` item, check its box (`- [x]`) in the same
  change, and add a one-line note if the implementation diverged from plan.
- Never commit secrets, API keys, or `.env` values.
- Prefer small, reviewable changes over large speculative refactors.
- If a requirement is ambiguous, state the assumption inline (code comment
  or PR description) rather than blocking on it.

## 11. Definition of Done

A feature is done when:

- [ ] It respects the role/permission matrix in `ROLES.md`
- [ ] It follows the design system in `DESIGN.md` (dark app shell for the
      dashboards, light shell for marketing pages)
- [ ] It reads/writes the correct entity in `SCHEMA.md`
- [ ] Relevant notifications fire, per the Notification System spec
      (§ Core Platform Services)
- [ ] It's checked off in `PLAN.md`
- [ ] Basic tests exist for any state-machine logic (e.g., task lifecycle
      transitions, CRM pipeline transitions)
