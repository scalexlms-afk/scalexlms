# DESIGN.md — ScaleX LaunchPad Design System

> Derived from the ScaleX LaunchPad brand sheet and Student/Admin dashboard
> mockups. Hex values below are close approximations read off the source
> screens — treat them as the starting palette and lock them exactly once a
> real design file (Figma) exists.

## 1. Brand Identity

- **Wordmark:** `scaleX` — lowercase "scale" + capital "X", bold geometric
  sans-serif, white on dark backgrounds.
- **Logomark:** a bold red upward arrow sitting above the wordmark, with a
  thin white "smile" swoosh beneath it (an Amazon-style nod — this is a
  brand for *Amazon* sellers, and the swoosh should read as an arrow from
  A→Z the way Amazon's does, not as a copy of Amazon's actual logo).
- **Tagline:** "Learn. Build. Launch. Grow." — always in that order, used as
  a section rhythm (see §8).
- **Voice:** confident, momentum-driven, achievement-oriented. Copy leans on
  verbs (Build, Launch, Scale, Achieve) and concrete numbers (45% complete,
  180 active students).

## 2. Two Shells, One Brand

The product has two distinct visual registers — don't mix them:

| | **App Shell** (Student + Admin dashboards) | **Marketing Shell** (landing/sales pages) |
|---|---|---|
| Background | Near-black (`#0B0B10`) | White / light neutral |
| Purpose | Focus, data density, "control room" feel | Persuasion, trust, energy |
| Cards | Dark elevated cards (`#16161D`) with subtle borders | White cards with soft shadow |
| Accent use | Red used sparingly for primary actions/alerts; charts carry the color variety | Red used generously — headlines, CTAs, icon backgrounds |

## 3. Color Palette

### Core brand
| Token | Hex | Use |
|---|---|---|
| `scalex-red` | `#E31E24` | Primary brand color, logo, CTA buttons, active nav states, progress-critical accents |
| `scalex-red-dark` | `#B4181D` | Hover/pressed state for red elements |
| `scalex-black` | `#0B0B10` | App shell background |
| `scalex-charcoal` | `#16161D` | Card / panel background on dark shell |
| `scalex-charcoal-alt` | `#1D1D26` | Secondary panel / hover surface |
| `scalex-white` | `#FFFFFF` | Marketing shell background, primary text on dark |

### Text on dark shell
| Token | Hex | Use |
|---|---|---|
| `text-primary-dark` | `#F5F5F7` | Headlines, key numbers |
| `text-secondary-dark` | `#9CA3AF` | Labels, captions, muted metadata |
| `text-tertiary-dark` | `#6B7280` | Disabled / placeholder |

### Data & status colors (charts, badges, pipeline states)
| Token | Hex | Use |
|---|---|---|
| `accent-blue` | `#3B82F6` | Secondary data series, links, info states |
| `accent-teal` | `#22D3EE` | Revenue/growth line charts |
| `accent-purple` | `#8B5CF6` | Donut/pie chart segments, "premium" accents |
| `accent-green` | `#22C55E` | Positive deltas, "Approved", "Active", success toasts |
| `accent-amber` | `#F59E0B` | "Pending Review", warnings, payment-risk flags |
| `accent-gold` | `#FFC94A` | Badges, trophies, gamification |
| `accent-danger` | `#EF4444` | Errors, "Inactive", overdue payments — kept distinct from `scalex-red` so brand red isn't read as "error" |

Reserve pure brand red for **brand and primary-action** moments; use
`accent-danger` (a slightly different red) for genuine error states so users
don't confuse "this is a ScaleX button" with "something went wrong."

### Light/marketing shell
| Token | Hex | Use |
|---|---|---|
| `bg-light` | `#FFFFFF` | Page background |
| `bg-light-alt` | `#F7F7F9` | Section alternation |
| `text-primary-light` | `#0B0B10` | Headlines |
| `text-secondary-light` | `#4B5563` | Body copy |

## 4. Typography

- **Display / Headings:** a bold geometric sans (e.g. Poppins, Sora, or
  Montserrat at 600–800 weight). Used for the wordmark, hero headlines, and
  big dashboard numbers (e.g. "$126,540", "68.7%").
- **Body / UI:** a clean grotesque sans (e.g. Inter or Roboto) at 400–500
  weight for everything else — labels, table cells, chat, descriptions.
- **Scale (web):**
  - H1 — 40/48px, bold — marketing hero only
  - H2 — 28/34px, semibold — section headers, portal page titles
  - H3 — 20/26px, semibold — card titles
  - Body — 15/22px, regular
  - Caption/Label — 12–13px, medium, uppercase tracking for eyebrow labels
    (e.g. "TOTAL REVENUE", "ACTIVE STUDENTS")
  - Big Metric — 32–40px, bold — dashboard KPI numbers

## 5. Component Library

### Cards
- Dark shell: `scalex-charcoal` background, 12–16px radius, 1px
  `rgba(255,255,255,0.06)` border, no heavy shadow (dark UIs rely on
  contrast, not shadow).
- Light shell: white background, 12–16px radius, soft `0 4px 20px
  rgba(0,0,0,0.06)` shadow.
- KPI cards (dashboard): icon chip (colored circle, 32–40px) + eyebrow label
  + big metric + small delta pill (`▲ 18.6%` in green / `▼` in red).

### Buttons
- Primary: `scalex-red` fill, white text, 8–10px radius, bold label.
- Secondary (dark shell): transparent with 1px white/10% border, white text.
- Tertiary/link: no fill, `scalex-red` text.
- Destructive: `accent-danger` fill.

### Progress
- Linear progress bar: track `rgba(255,255,255,0.08)` on dark shell, fill
  `scalex-red`, rounded ends, animated fill on load.
- Donut/ring progress: multi-segment (used for "Completion Rate by
  Milestone") — segments cycle through `accent-purple`, `accent-blue`,
  `accent-teal`, `scalex-red`, `accent-amber`.

### Status pills / badges
Rounded-full, 12px text, colored background at 15–20% opacity with
full-opacity text of the same hue:
- `Approved / Active` → green
- `Under Review / Pending` → amber
- `Revision Required / Overdue` → danger red
- `Not Started` → neutral gray

### Gamification badges
Circular gold-rimmed medallion (`accent-gold` ring on `scalex-charcoal`
fill) with a trophy glyph — used for "Product Found," "Supplier Selected,"
"First Sale," and level-up moments. These should feel earned: subtle shine/
shimmer animation on unlock, not just a static icon swap.

### Tables (Admin portal)
Dark rows on `scalex-charcoal`, zebra striping at 3–4% white opacity,
sticky header row, row-hover highlight, inline status pills instead of
plain text for state columns.

### Navigation
Left sidebar, dark (`scalex-black`), grouped sections with small uppercase
group labels (ACADEMY / BUSINESS / SYSTEM as seen in the Admin OS), active
item marked with a `scalex-red` left-border accent + subtle fill.

## 6. Iconography

Simple, filled or duotone line icons (not skeuomorphic). Icon chips on KPI
cards use a colored circular background at ~15% opacity matching that
metric's semantic color (e.g., revenue = green, students = blue, growth =
purple). Keep stroke weight consistent (~1.5–2px) across the whole icon set.

## 7. Layout & Spacing

- Base spacing unit: **4px**. Common gaps: 8 / 12 / 16 / 24 / 32px.
- Dashboard grid: 12-column responsive grid; KPI cards typically span 2–3
  columns each on desktop, stack to full-width on mobile.
- Card internal padding: 20–24px.
- Max content width (marketing pages): ~1200px, centered.

## 8. Signature Layout Pattern: The Journey Strip

Several source diagrams (Mission, Student Journey, Learning Roadmap) use a
horizontal numbered-step strip with connecting arrows/dotted lines — circular
icon badges (color-coded per stage) linked left-to-right, each with a short
title + one-line description underneath. Reuse this pattern anywhere the
product needs to communicate "this is a sequence with momentum" — it's the
single most recognizable ScaleX layout motif and should appear on the
marketing roadmap page, the student onboarding flow, and any "how it works"
explainer.

## 9. Dashboard Content Patterns (reference, not to be copied pixel-for-pixel)

**Student dashboard cards:** Amazon Journey Progress (ring/bar), Current
Stage, Course Completion %, Today's Task, Upcoming Class, Mentor Notes,
Announcements, Achievements.

**Admin dashboard cards:** Total Revenue, Total Students, Completion Rate,
Active Students, Growth (MoM) — each with a small sparkline/trend and a
colored delta. Below: Revenue Overview (line chart), Student Growth (bar
chart), AI Insights panel (Weak Students / Pending Reviews / Follow Ups as
three sub-cards with avatar stacks + a CTA button), and Completion Rate by
Milestone (donut chart with legend).

## 10. Accessibility

- Maintain WCAG AA contrast: on `scalex-black`/`scalex-charcoal`, body text
  must use `text-primary-dark` or `text-secondary-dark`, never raw grays
  below 4.5:1 contrast.
- Never rely on color alone for status — every status pill carries a label,
  not just a color.
- Red-on-dark CTAs must hit at least 4.5:1 against their background; verify
  `scalex-red` (#E31E24) against `scalex-charcoal` (#16161D) before shipping
  small text in that combination — prefer it for buttons/large text only.

## 11. Semantic Tokens, Light/Dark & Glass/Metallic (implemented)

The brand red and accent hues stay constant across themes; only surfaces,
text, and borders swap. All tokens live in
`packages/config/tailwind/theme.css`. **Prefer the semantic tokens below for
all new UI** — they adapt automatically to light/dark. The legacy
`scalex-*` / `text-*-dark` names still exist for back-compat (and re-point in
light mode) but should not be used for new surfaces.

| Semantic token | Utility | Dark | Light | Use |
|---|---|---|---|---|
| `--color-surface` | `bg-surface` | `#0b0b10` | `#f4f5f8` | Page background |
| `--color-surface-2` | `bg-surface-2` | `#16161d` | `#ffffff` | Cards / elevated panels |
| `--color-surface-3` | `bg-surface-3` | `#1d1d26` | `#eceef3` | Hover / secondary fills |
| `--color-foreground` | `text-foreground` | `#f5f5f7` | `#0b0b10` | Primary text |
| `--color-muted` | `text-muted` | `#9ca3af` | `#4b5563` | Secondary text |
| `--color-subtle` | `text-subtle` | `#6b7280` | `#6b7280` | Tertiary text |
| `--color-line` | `border-line` / `divide-line` | white 8% | ink 10% | Hairline borders |
| `--color-line-strong` | `border-line-strong` | white 14% | ink 16% | Emphasis borders |

### Glass + metallic utilities

- `glass` / `glass-strong` — backdrop-blur translucent panel using
  `--surface-glass` + `--border-glass` (both theme-aware).
- `metallic-edge` — subtle inset top sheen + rim (layers over any bg).
- `metallic-graphite` / `metallic-red` — gradient backgrounds
  (graphite = neutral panels/buttons; red = primary CTA).
- `glow-red` — brand-red drop shadow for primary CTAs.
- `shimmer-sheen` (+ `animate-shimmer`) — animated highlight sweep, used on
  earned `BadgeMedallion`s.

Primary `Button` = `metallic-red` gradient + inset sheen + red glow. `Card`
gains a `glass` variant and a default `metallic-edge` sheen.

### Theme system

- Active theme is set via `data-theme="dark|light"` on `<html>`.
- `<ThemeScript />` (in both root layouts, first child of `<body>`) resolves
  the theme before first paint (localStorage → system preference → dark) to
  avoid a flash-of-wrong-theme.
- `<ThemeProvider>` wraps the app; `useTheme()` exposes `theme` / `setTheme` /
  `toggleTheme`; `<ThemeToggle />` is placed in both shell headers and on the
  landing + auth pages. Choice persists in `localStorage['scalex-theme']`.

### Chart colors

Chart palettes are centralized in `packages/ui/src/tokens.ts`
(`CHART_COLORS`, `CHART_LINE_COLOR`, `CHART_AXIS_COLOR`, etc.) — never
hardcode chart hex in components or `admin-portal/src/lib/data.ts`.

### Tailwind content scanning

The shared `@scalex/ui` package resolves through a `node_modules` symlink,
which Tailwind ignores by default. `theme.css` includes
`@source "../../ui/src/**/*.{ts,tsx}"` so classes used only inside the UI
package (including the custom `@utility` classes above) are generated. Add
new shared-component class usage under that path or they won't compile.
