export type SubmissionStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "revision_required";

const VALID_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  not_started: ["submitted"],
  submitted: ["under_review", "revision_required", "approved"],
  under_review: ["approved", "revision_required"],
  revision_required: ["submitted"],
  approved: [],
};

export function canTransitionSubmission(
  from: SubmissionStatus,
  to: SubmissionStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertSubmissionTransition(
  from: SubmissionStatus,
  to: SubmissionStatus
): void {
  if (!canTransitionSubmission(from, to)) {
    throw new Error(`Invalid submission transition: ${from} -> ${to}`);
  }
}

export function submissionStatusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    not_started: "Not Started",
    submitted: "Submitted",
    under_review: "Under Review",
    approved: "Approved",
    revision_required: "Revision Required",
  };
  return labels[status];
}

export function submissionStatusVariant(
  status: SubmissionStatus
): "not_started" | "pending" | "review" | "approved" | "revision" {
  const map: Record<
    SubmissionStatus,
    "not_started" | "pending" | "review" | "approved" | "revision"
  > = {
    not_started: "not_started",
    submitted: "pending",
    under_review: "review",
    approved: "approved",
    revision_required: "revision",
  };
  return map[status];
}

const MILESTONE_BADGE_MAP: Record<number, string> = {
  4: "product_found",
  5: "supplier_selected",
  7: "first_sale",
};

export function badgeKeyForMilestone(orderIndex: number): string | null {
  return MILESTONE_BADGE_MAP[orderIndex] ?? null;
}

export const BADGE_LABELS: Record<string, string> = {
  product_found: "Product Found",
  supplier_selected: "Supplier Selected",
  first_sale: "First Sale",
  milestone_1: "Foundation Complete",
  milestone_2: "Business Setup",
  milestone_3: "Brand Research",
  milestone_4: "Product Hunting",
  milestone_5: "Sourcing",
  milestone_6: "Brand Development",
  milestone_7: "Launch",
  milestone_8: "Scaling",
};

export const LEVEL_LABELS: Record<string, string> = {
  beginner_seller: "Beginner Seller",
  research_expert: "Research Expert",
  brand_builder: "Brand Builder",
  amazon_launcher: "Amazon Launcher",
};
