import { createServiceClient } from "@scalex/db/server";
import type { LeadStage, UserRole } from "@scalex/db/types";

export function getServiceDb() {
  return createServiceClient();
}

export const LEAD_STAGES: LeadStage[] = [
  "new_lead",
  "contacted",
  "interested",
  "demo",
  "payment_pending",
  "enrolled",
];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  interested: "Interested",
  demo: "Demo",
  payment_pending: "Payment Pending",
  enrolled: "Enrolled",
};

export type AdminScope = {
  userId: string;
  role: UserRole;
};

export function canManageAllStudents(role: UserRole): boolean {
  return role === "super_admin" || role === "instructor";
}

export function canAssignMentor(role: UserRole): boolean {
  return role === "super_admin";
}

export function canManageLeads(role: UserRole): boolean {
  return role === "super_admin" || role === "sales";
}

export function canManageFinance(role: UserRole): boolean {
  return role === "super_admin";
}

export function canViewFinancePartial(role: UserRole): boolean {
  return role === "sales";
}

export async function getSalesConvertedStudentIds(
  userId: string
): Promise<string[]> {
  const db = getServiceDb();
  const { data } = await db
    .from("leads")
    .select("converted_user_id")
    .eq("assigned_sales_id", userId)
    .not("converted_user_id", "is", null);

  return (data ?? [])
    .map((row) => row.converted_user_id)
    .filter((id): id is string => Boolean(id));
}
