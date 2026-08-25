/** One source of truth for student program progress display. */

export function normalizeProgressPercent(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampStep(index: number, total: number): number {
  const max = Math.max(1, total);
  return Math.min(max, Math.max(1, Math.round(index) || 1));
}
