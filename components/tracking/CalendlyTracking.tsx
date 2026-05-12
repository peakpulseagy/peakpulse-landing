"use client";

import { useEffect } from "react";

/**
 * CalendlyTracking
 *
 * Listens for Calendly's `event_scheduled` postMessage and fires the
 * Google Ads conversion when a visitor completes a strategy-call
 * booking inside the popup widget.
 *
 * Why postMessage:
 *   Calendly's confirmation page lives on calendly.com, not on
 *   peakpulseagy.com. A traditional gtag conversion snippet placed on
 *   a "thank-you" page would never fire because the visitor never
 *   lands back on our domain. Calendly's popup, however, runs inside
 *   an iframe and broadcasts `calendly.event_scheduled` to the parent
 *   window the moment a booking is confirmed. We catch that and fire
 *   the conversion immediately.
 *
 * This file is mounted once globally in app/layout.tsx so the listener
 * is active for every page that exposes a Calendly CTA.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type CalendlyMessage = {
  event?: string;
};

function isCalendlyEvent(value: unknown): value is CalendlyMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { event?: unknown }).event === "string" &&
    (value as { event: string }).event.startsWith("calendly.")
  );
}

export default function CalendlyTracking({
  conversionLabel,
}: {
  conversionLabel: string;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: MessageEvent) => {
      if (!isCalendlyEvent(e.data)) return;
      if (e.data.event !== "calendly.event_scheduled") return;

      // Fire the Google Ads conversion. The default value + currency
      // were set on the conversion action itself (USD $300), so we
      // don't need to send them here. Sending them anyway keeps the
      // value attached to the specific booking event for clarity.
      window.gtag?.("event", "conversion", {
        send_to: conversionLabel,
        value: 300.0,
        currency: "USD",
      });
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [conversionLabel]);

  return null;
}
