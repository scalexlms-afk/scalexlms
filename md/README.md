# ScaleX LaunchPad

**AI-powered ecommerce learning & brand-building platform.**
*Learn. Build. Launch. Grow.*

ScaleX LaunchPad takes a student from complete beginner to a live Amazon FBA
Private Label brand owner — not through passive video courses, but through a
structured roadmap of milestones, graded tasks, AI mentorship, and human
mentor validation.

This repo/doc set covers two connected products sharing one backend:

| Portal | Codename | Who uses it |
|---|---|---|
| Student Portal | **ScaleX LaunchPad** | Students working through the roadmap |
| Admin Portal | **ScaleX Management OS** | Super Admin, Instructors, Mentors, Sales |

Both are powered by a shared **AI Intelligence Layer** and a single **data
layer**, with a native mobile app planned for a later phase.

## Documentation Map

Read in this order:

1. **[AGENTS.md](./AGENTS.md)** — start here if you're an AI coding agent or a
   new engineer. Architecture, domain model, tech stack, conventions,
   working agreements.
2. **[DESIGN.md](./DESIGN.md)** — the visual system: colors, type, components,
   dark dashboard shell vs. light marketing shell.
3. **[PLAN.md](./PLAN.md)** — phased build plan with checkboxes, derived from
   the original product spec's 4-phase roadmap.
4. **[SCHEMA.md](./SCHEMA.md)** — database entities, fields, and relationships.
5. **[ROLES.md](./ROLES.md)** — the full role-permission matrix (Super Admin,
   Instructor, Mentor, Sales, Student).

## The 60-Second Pitch

- **Learning hierarchy:** `Course → Milestone → Module → Lesson → Task`
- **8 milestones** carry a student from Foundation through Business Setup,
  Brand Research, Product Hunting, Sourcing, Brand Development, Launch, and
  Scaling.
- Every milestone ends in a **Task** the student must submit (image, Excel,
  PDF, link, or text) — reviewed by **AI + a human Mentor**, not AI alone.
- An **AI Mentor** (80% grounded in ScaleX's own academy content, 20% general
  ecommerce knowledge) is available to students 24/7 for questions,
  assignment help, product validation, and strategy help.
- **Gamification** — 4 student levels (Beginner Seller → Amazon Launcher) and
  milestone badges (Product Found, Supplier Selected, First Sale) — keeps
  motivation visible.
- **Admin side** runs the whole academy business: CRM/lead pipeline, finance
  (70/30 payment split), content management, mentor assignment, and an AI
  Intelligence Dashboard that flags inactive or at-risk students automatically.

## Status

This documentation set was generated from the original ScaleX LaunchPad
product spec (v1.0) and translated into build-ready project docs. No code,
stack choice, or infrastructure has been locked in yet — `AGENTS.md` proposes
a reasonable default stack, but treat it as a starting point, not a mandate.

## Getting Started (once a codebase exists)

```bash
# placeholder — replace with real commands once package.json exists
pnpm install
pnpm dev
```

See `AGENTS.md §9` for the command list to keep updated as the project grows.
