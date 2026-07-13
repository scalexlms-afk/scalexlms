import { describe, expect, it } from "vitest";
import {
  assertLeadTransition,
  canTransitionLead,
  canTransitionLeadForward,
} from "../src/leads";

describe("CRM lead pipeline state machine", () => {
  it("allows flexible board moves before enrolled", () => {
    expect(canTransitionLead("new_lead", "demo")).toBe(true);
    expect(canTransitionLead("contacted", "payment_pending")).toBe(true);
  });

  it("documents happy-path forward edges", () => {
    expect(canTransitionLeadForward("new_lead", "contacted")).toBe(true);
    expect(canTransitionLeadForward("payment_pending", "enrolled")).toBe(true);
    expect(canTransitionLeadForward("new_lead", "enrolled")).toBe(false);
  });

  it("blocks moves out of enrolled", () => {
    expect(canTransitionLead("enrolled", "new_lead")).toBe(false);
  });

  it("throws when leaving enrolled", () => {
    expect(() => assertLeadTransition("enrolled", "demo")).toThrow(
      /Invalid lead transition/
    );
  });
});
