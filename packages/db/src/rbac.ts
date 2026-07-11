import type { UserRole } from "./database.types";

export type PermissionLevel = "full" | "partial" | "own" | "none";

export type Feature =
  | "dashboard"
  | "student_management"
  | "course_content"
  | "live_sessions"
  | "task_review"
  | "community"
  | "ai_mentor"
  | "crm"
  | "finance"
  | "reports"
  | "system_settings";

const PERMISSION_MATRIX: Record<Feature, Record<UserRole, PermissionLevel>> = {
  dashboard: {
    super_admin: "full",
    instructor: "full",
    mentor: "own",
    sales: "own",
    student: "own",
  },
  student_management: {
    super_admin: "full",
    instructor: "partial",
    mentor: "own",
    sales: "partial",
    student: "none",
  },
  course_content: {
    super_admin: "full",
    instructor: "full",
    mentor: "partial",
    sales: "none",
    student: "partial",
  },
  live_sessions: {
    super_admin: "full",
    instructor: "full",
    mentor: "partial",
    sales: "none",
    student: "partial",
  },
  task_review: {
    super_admin: "full",
    instructor: "partial",
    mentor: "full",
    sales: "none",
    student: "partial",
  },
  community: {
    super_admin: "full",
    instructor: "partial",
    mentor: "partial",
    sales: "none",
    student: "partial",
  },
  ai_mentor: {
    super_admin: "full",
    instructor: "partial",
    mentor: "partial",
    sales: "none",
    student: "partial",
  },
  crm: {
    super_admin: "full",
    instructor: "none",
    mentor: "none",
    sales: "full",
    student: "none",
  },
  finance: {
    super_admin: "full",
    instructor: "none",
    mentor: "none",
    sales: "partial",
    student: "own",
  },
  reports: {
    super_admin: "full",
    instructor: "partial",
    mentor: "own",
    sales: "partial",
    student: "none",
  },
  system_settings: {
    super_admin: "full",
    instructor: "none",
    mentor: "none",
    sales: "none",
    student: "none",
  },
};

export function getPermission(
  role: UserRole,
  feature: Feature
): PermissionLevel {
  return PERMISSION_MATRIX[feature][role];
}

export function canAccess(
  role: UserRole,
  feature: Feature,
  minLevel: PermissionLevel = "partial"
): boolean {
  const level = getPermission(role, feature);
  if (level === "none") return false;
  if (minLevel === "full") return level === "full";
  if (minLevel === "partial")
    return level === "full" || level === "partial" || level === "own";
  return true;
}

export function isAdminRole(role: UserRole): boolean {
  return role !== "student";
}

export function requireRole(
  role: UserRole | null | undefined,
  allowed: UserRole[]
): asserts role is UserRole {
  if (!role || !allowed.includes(role)) {
    throw new Error("Unauthorized");
  }
}

export function requireFeature(
  role: UserRole | null | undefined,
  feature: Feature,
  minLevel: PermissionLevel = "partial"
): asserts role is UserRole {
  if (!role || !canAccess(role, feature, minLevel)) {
    throw new Error("Forbidden");
  }
}
