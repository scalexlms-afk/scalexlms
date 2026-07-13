import type { PlanType } from "./database.types";

export const PLAN_LABELS: Record<PlanType, string> = {
  standard: "Standard",
  premium: "Premium Launch Program",
};

export const PLAN_SHORT_LABELS: Record<PlanType, string> = {
  standard: "Standard",
  premium: "Premium",
};

export const PLAN_FEATURES: Record<PlanType, readonly string[]> = {
  standard: [
    "Recorded curriculum",
    "AI Mentor access",
    "Templates and task sheets",
    "Community and support tickets",
  ],
  premium: [
    "Everything in Standard",
    "Live classes and workshops",
    "Private mentor calls",
    "Priority review and launch support",
  ],
};

export function normalizePlan(
  value: string | null | undefined
): PlanType {
  return value === "premium" ? "premium" : "standard";
}

export function isPremiumPlan(
  value: string | null | undefined
): boolean {
  return normalizePlan(value) === "premium";
}

export function planLabel(
  value: string | null | undefined,
  short = false
): string {
  const plan = normalizePlan(value);
  return short ? PLAN_SHORT_LABELS[plan] : PLAN_LABELS[plan];
}

/** StatusPill variant: Premium stands out; Standard stays muted. */
export function planPillVariant(
  value: string | null | undefined
): "approved" | "neutral" {
  return isPremiumPlan(value) ? "approved" : "neutral";
}
