type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

export type FunnelEvent =
  | "register"
  | "checkout_start"
  | "payment_success"
  | "milestone_approved"
  | "plan_upgrade";

export function trackEvent(
  event: FunnelEvent,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}
