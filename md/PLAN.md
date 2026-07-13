# PLAN.md — ScaleX LaunchPad Build Plan

> Source spec defines four phases: **Foundation → Tasks/AI/Community →
> Admin/CRM/Finance → Mobile**. This document expands each into concrete,
> checkable work items. Check boxes off as work lands; add a one-line note
> if an implementation diverges from the plan.

## Guiding Principles

- Ship the **student-facing execution loop** (lesson → task → review →
  progress) before anything else — it's the core value proposition.
- Admin tooling can lag behind student features in Phase 1–2, but Mentors
  need *some* way to review tasks the moment students can submit them.
- Every phase ends with its own smoke-test pass against `ROLES.md` — don't
  let permission gaps compound across phases.
- Design system (`DESIGN.md`) components should be built once, in
  `packages/ui`, and reused by both portals from Phase 1 onward — don't let
  the two portals diverge visually.

---

## Phase 1 — Foundation

**Goal:** a student can register, pay, log in, and see their dashboard and
course content, even if tasks/AI/community aren't live yet.

### Auth & Accounts
- [x] User model with role field (`super_admin | instructor | mentor | sales
      | student`) — `profiles` table + Supabase Auth trigger
- [x] Registration + payment flow (first-payment gate before account
      activation, per the 70/30 payment rule) — Stripe Checkout + webhook; plan
      settings in `payment_plan_settings` table (configurable 70/30). Remaining
      30% + Standard→Premium upgrade checkout added in web-gaps pass.
- [x] Login / session management — Supabase Auth + middleware session refresh
- [x] Account activation email/flow — signup confirmation via Supabase Auth;
      account flips to `active` on first-payment webhook (no separate
      post-payment email yet)
- [x] Password reset — `/reset-password` + Supabase `resetPasswordForEmail`

### Student Dashboard (v1)
- [x] Welcome header ("Welcome back, {name}")
- [x] Amazon Journey Progress card (overall % + current stage)
- [x] Today's Task card (static/placeholder until Phase 2 task engine lands)
- [x] Upcoming Class card (placeholder until live sessions ship) — Premium
      shows invited sessions; Standard shows upgrade CTA
- [x] Announcements feed (read-only)

### Courses & Learning Roadmap
- [x] Course → Milestone → Module → Lesson data model (see `SCHEMA.md`)
- [x] Seed the 8-milestone Amazon FBA roadmap content structure — 8 milestones,
      8 modules, 17 lessons seeded via `supabase/seed/001_roadmap.sql`
- [x] Milestone roadmap UI (the "journey strip" pattern from `DESIGN.md §8`)
- [x] Lesson viewer (video/PDF/text content types) — all four types supported;
      seed content is text-only for now
- [x] Per-lesson "mark complete" and rollup progress % to milestone/course —
      `lesson_completions` + DB trigger `refresh_enrollment_completion`

### Design System Bootstrap
- [x] `packages/ui` scaffolded with tokens from `DESIGN.md` (colors, type
      scale, spacing)
- [x] Core components: Button, Card, KPI Card, Progress Bar, Status Pill,
      Nav Sidebar (+ Journey Strip bonus component)

**Phase 1 exit criteria:** a paying student can log in, browse the roadmap,
watch/read lessons, and see accurate completion %.

---

## Phase 2 — Tasks, AI, Community

**Goal:** the execution loop is complete — students submit real work, get
AI + mentor feedback, unlock badges, and can talk to the AI Mentor and each
other.

### Task Management System
- [x] Task model + state machine: `Not Started → Submitted → Under Review →
      Approved | Revision Required` — `tasks`/`submissions`/`reviews` tables +
      `assertSubmissionTransition()` in `@scalex/db`
- [x] Submission UI supporting images, Excel, PDF, links, text — `/tasks/[milestoneId]`
      with `submissions` storage bucket
- [x] Mentor review queue (Admin side) with approve / request-revision
      actions + feedback text — `/reviews` in admin portal
- [x] Notifications on state change (student: "Task Review"; admin: task
      submitted) — in-app `notifications` table + bell in both shells
- [x] Task completion gates milestone progression — `is_milestone_unlocked()`
      SQL + extended `refresh_enrollment_completion` includes gating-task approval

### AI Mentor
- [x] AI chat interface in Student Portal — `/ai-mentor` with streaming chat
- [x] Knowledge grounding: 80% ScaleX academy content (RAG over
      courses/lessons/resources), 20% general ecommerce knowledge — Postgres FTS
      via `search_lessons_context` RPC (not vector RAG; LongCat has no embeddings)
- [x] AI use cases: answer questions, assignment help, product validation,
      strategy help — grounded system prompt in `@scalex/ai`
- [x] AI pre-scoring/annotation pass on task submissions, surfaced to
      mentors before their review (AI assists, never auto-approves — see
      `AGENTS.md §2`) — `scoreSubmission()` on submit; mentors see `ai_score`/`ai_notes`

### Community Platform
- [x] Channels: Announcements, Product Hunting, Supplier Help, PPC
      Discussion, Questions, Student Wins — `community_channel` enum
- [x] Posts, comments, likes — `community_posts`, `comments`, `post_likes`
- [x] Post approval/moderation queue — `/community` moderation in admin portal
- [x] Basic membership/role visibility rules per `ROLES.md` — RLS on posts/comments

### Gamification
- [x] Student levels: Beginner Seller → Research Expert → Brand Builder →
      Amazon Launcher, driven by milestone completion — DB trigger on submission
      approval updates `profiles.level`
- [x] Badges: Product Found, Supplier Selected, First Sale (+ room to add
      more), event-driven off task/milestone approval — `badges` table +
      `badgeKeyForMilestone()` on mentor approve
- [x] Achievements section on student dashboard — `BadgeMedallion` component

### Live Sessions (v1)
- [x] Session model: Batch Classes, Masterclasses, Q&A Sessions, Case
      Studies — `live_sessions` + `session_registrations`
- [x] Schedule + reminder notifications — admin create notifies active students
      (in-app only; email/WhatsApp deferred to Phase 3)
- [x] Recording access post-session — `/sessions` shows recordings when
      `recording_url` set; admin can target All Premium or selected students
      (invite-only visibility via `session_registrations`)

**Phase 2 exit criteria:** a student can complete a milestone end-to-end —
learn, submit, get AI-assisted mentor feedback, get approved, earn a badge —
without any manual/offline steps.

---

## Phase 3 — Admin, CRM, Finance

**Goal:** ScaleX can run the *business* of the academy from the Admin
Portal — not just deliver content.

### Admin Dashboard
- [x] KPI cards: Total Revenue, Total Students, Completion Rate, Active
      Students, Growth (MoM)
- [x] Revenue Overview chart, Student Growth chart
- [x] AI Insights panel: Weak Students, Pending Reviews, Follow Ups
- [x] Completion Rate by Milestone (donut chart)

### Student Management
- [x] Admin student list + detail view: profile, plan, progress, stage,
      payments, tasks, messages, activity
- [x] Mentor assignment

### Content Management
- [x] CRUD for Courses / Milestones / Modules / Lessons / Tasks
- [x] File upload pipeline: video, PDF, Excel, links — URL-based lesson
      content for now; storage bucket wiring deferred

### CRM System
- [x] Lead model + pipeline: `New Lead → Contacted → Interested → Demo →
      Payment Pending → Enrolled`
- [x] Lead fields: name, WhatsApp, source, sales person
- [x] Sales-facing lead list + pipeline board view

### Finance System
- [x] Payments, invoices, installments, expenses — remaining balance row created
      on first payment; student can pay via `/payment?mode=remaining`
- [x] 70% first-payment / 30% remaining rule as a configurable plan setting
- [x] Payment-risk flag surfaced to AI Intelligence Dashboard

### Mentorship Panel
- [x] Mentor view: assigned students, progress, submissions, messages,
      calls log — mentor-scoped `/students` roster + detail; mentor calls table
      + reply messages; support tickets queue

### AI Intelligence Dashboard (Admin)
- [x] Detection: inactive students, weak performance, slow progress,
      payment risk
- [x] Output: reports, recommendations, suggested actions/follow-ups

### Notifications & Audit
- [x] Student notifications: lesson unlock, task review, messages, payments
      — milestone unlock on approval; payment/enrollment/upgrade notifications
- [x] Admin notifications: enrollment, reviews, follow-ups — dashboard
      insights link to action queues; enrollment notify on first payment
- [x] Audit log for all admin actions (create/edit/delete, role changes,
      payment actions) — Phase 3 mutations log to `audit_log`

**Phase 3 exit criteria:** Super Admin, Instructor, Mentor, and Sales can
each do their full job inside the Admin Portal with correct, role-scoped
access (`ROLES.md`), and business metrics on the dashboard are live, not
mocked.

---

## Phase 4 — Mobile

**Goal:** native mobile parity for the highest-value student flows, same
backend as web.

- [ ] iOS app (learning, community, notifications, AI mentor)
- [ ] Android app (same feature set)
- [ ] Push notifications wired to the shared Notification Service
- [ ] Offline/low-connectivity handling for lesson video (stretch goal)

**Phase 4 exit criteria:** a student can complete the core execution loop
(lesson → task → AI mentor → notification) entirely from the mobile app.

---

## Cross-Cutting Workstreams (ongoing across all phases)

- [ ] **Design system fidelity** — every new screen reviewed against
      `DESIGN.md` before merge
- [ ] **RBAC coverage** — every new route/endpoint reviewed against
      `ROLES.md` before merge
- [x] **Testing** — state-machine logic (task lifecycle, CRM pipeline) gets
      unit tests from Phase 2 onward — `submissions.test.ts` + `leads.test.ts`
- [x] **Analytics instrumentation** — key funnel events (registration,
      milestone completion, task approval, churn signals) tracked from
      Phase 1 onward so Phase 3's AI Intelligence Dashboard has real
      historical data to work with — `trackEvent()` GA4 helper on checkout /
      payment success
- [x] **Security & compliance** — audit logging, data privacy for student
      records, payment data handling reviewed before Phase 3 finance ships —
      covered by `009_rls_hardening` + `audit_log` (ongoing review still advised)

## Audit Fixes + Design Overhaul (2026-07 pass)

One-time hardening + visual pass layered on the existing app (see
`DESIGN.md §11` for the design details):

- **Security (RLS):** `009_rls_hardening.sql` — profile/submission/community
  self-escalation guards, enrollment-scoped lesson/media reads, scoped
  `search_lessons_context`, paid-enrollment insert check.
- **Reliability:** `error.tsx` / `not-found.tsx` / `loading.tsx` for both
  apps, admin `/forbidden` 403 page, `requireFeaturePage` redirects instead
  of 500s, shared `FormError` / `FormSuccess` / `SubmitButton`.
- **Student fixes:** unauthorized redirect-loop, open-redirect validation,
  real password reset + `/update-password`, Stripe URL fallback + idempotent
  first payment, lesson gating, YouTube/Vimeo/HLS embeds, task-submit
  resilience, mobile nav.
- **Admin fixes:** content-mutation RBAC + read-only UI gating, dashboard /
  AI-insight scoping for mentor/sales, instructor cannot final-approve,
  super_admin self-demotion guard, nested-form fix, private-bucket media
  preview (`getSecureMediaUrl`).
- **Design:** semantic themeable tokens + working light/dark mode with a
  no-flash script and persisted toggle, glass + metallic utilities, centralized
  chart colors. Diverged from plan by re-pointing legacy tokens in light mode
  (safety net) rather than migrating every raw `-dark` class.

## Suggested Success Metrics per Phase

| Phase | Primary metric |
|---|---|
| 1 | % of paying students who reach their first lesson within 24h of activation |
| 2 | % of started milestones that reach "Approved" without abandonment |
| 3 | Time from lead creation to enrollment; admin task-review turnaround time |
| 4 | Mobile DAU as % of total active students |
