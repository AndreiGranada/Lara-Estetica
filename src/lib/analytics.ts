export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

function compactPayload(payload: AnalyticsPayload): Record<string, unknown> {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries);
}

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPayload = compactPayload(payload);
  const eventObject = { event: eventName, ...normalizedPayload };

  window.dispatchEvent(new CustomEvent("lara:analytics", { detail: eventObject }));

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventObject);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, normalizedPayload);
  }
}
