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

export type VisibilityEvent =
  | "ai_referral"
  | "inp_threshold_exceeded"
  | "aicf_citation_detected";

export type AnalyticsEvent = FunnelEvent | VisibilityEvent;

export function trackEvent(
  event: AnalyticsEvent,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}

/** Track AI Citation Frequency (AICF) when a scaling-related query drives traffic. */
export function trackAicfCitation(params: {
  queryTopic: string;
  sourceEngine: string;
  pagePath: string;
}) {
  trackEvent("aicf_citation_detected", {
    query_topic: params.queryTopic,
    source_engine: params.sourceEngine,
    page_path: params.pagePath,
  });
}
