import type { LeadStage } from "./database.types";

/** Happy-path forward edges (used by docs/tests). Runtime CRM allows flexible moves until enrolled. */
export const LEAD_FORWARD_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  new_lead: ["contacted", "interested"],
  contacted: ["interested", "demo"],
  interested: ["demo", "payment_pending"],
  demo: ["payment_pending"],
  payment_pending: ["enrolled"],
  enrolled: [],
};

export function canTransitionLead(from: LeadStage, to: LeadStage): boolean {
  if (from === to) return true;
  // Enrolled is terminal; otherwise allow board flexibility (sales often skip stages).
  if (from === "enrolled") return false;
  return true;
}

export function assertLeadTransition(from: LeadStage, to: LeadStage): void {
  if (!canTransitionLead(from, to)) {
    throw new Error(`Invalid lead transition: ${from} -> ${to}`);
  }
}

export function canTransitionLeadForward(
  from: LeadStage,
  to: LeadStage
): boolean {
  return LEAD_FORWARD_TRANSITIONS[from]?.includes(to) ?? false;
}
