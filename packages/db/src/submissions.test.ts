import { describe, expect, it } from "vitest";
import {
  assertSubmissionTransition,
  canTransitionSubmission,
} from "../src/submissions";

describe("submission state machine", () => {
  it("allows not_started -> submitted", () => {
    expect(canTransitionSubmission("not_started", "submitted")).toBe(true);
  });

  it("allows submitted -> under_review", () => {
    expect(canTransitionSubmission("submitted", "under_review")).toBe(true);
  });

  it("allows under_review -> approved", () => {
    expect(canTransitionSubmission("under_review", "approved")).toBe(true);
  });

  it("allows under_review -> revision_required", () => {
    expect(
      canTransitionSubmission("under_review", "revision_required")
    ).toBe(true);
  });

  it("allows revision_required -> submitted", () => {
    expect(canTransitionSubmission("revision_required", "submitted")).toBe(
      true
    );
  });

  it("blocks approved -> submitted", () => {
    expect(canTransitionSubmission("approved", "submitted")).toBe(false);
  });

  it("blocks not_started -> approved", () => {
    expect(canTransitionSubmission("not_started", "approved")).toBe(false);
  });

  it("throws on invalid transition", () => {
    expect(() => assertSubmissionTransition("approved", "submitted")).toThrow(
      "Invalid submission transition"
    );
  });
});
