/**
 * Shared design tokens for JS-land consumers (charts, canvas, inline styles)
 * that can't read Tailwind classes. Keep these in sync with
 * `packages/config/tailwind/theme.css`.
 */

export const BRAND = {
  red: "#e31e24",
  redDark: "#b4181d",
} as const;

export const ACCENTS = {
  blue: "#3b82f6",
  teal: "#22d3ee",
  purple: "#8b5cf6",
  green: "#22c55e",
  amber: "#f59e0b",
  gold: "#ffc94a",
  danger: "#ef4444",
} as const;

/** Ordered categorical palette for charts (donut slices, multi-series). */
export const CHART_COLORS: string[] = [
  BRAND.red,
  ACCENTS.blue,
  ACCENTS.green,
  ACCENTS.amber,
  ACCENTS.purple,
  ACCENTS.teal,
  ACCENTS.gold,
];

/** Semantic single-series chart colors. */
export const CHART_LINE_COLOR = BRAND.red;
export const CHART_BAR_COLOR = ACCENTS.blue;

/** Chart chrome (axes, grid, tooltip) — muted, works on dark surfaces. */
export const CHART_AXIS_COLOR = "#9ca3af";
export const CHART_GRID_COLOR = "rgba(148, 163, 184, 0.15)";
export const CHART_TOOLTIP_STYLE = {
  background: "var(--color-surface-2, #16161d)",
  border: "1px solid var(--color-line, rgba(255,255,255,0.08))",
  borderRadius: 8,
  color: "var(--color-foreground, #f5f5f7)",
} as const;
