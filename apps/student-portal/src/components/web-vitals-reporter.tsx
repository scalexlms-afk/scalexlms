"use client";

import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });

    if (metric.name === "INP" && metric.value > 200) {
      trackEvent("inp_threshold_exceeded", {
        inp_value: Math.round(metric.value),
        page_path: window.location.pathname,
      });
    }
  });

  return null;
}
