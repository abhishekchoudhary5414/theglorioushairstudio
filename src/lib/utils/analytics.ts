export interface TrackEventParams {
  eventType: "call_click" | "whatsapp_click" | "enquiry_click" | "booking_click" | "page_view";
  serviceName?: string;
  sourceLocation?: string;
  targetUrl?: string;
  pagePath?: string;
}

/**
 * Fires a lightweight client-side beacon/fetch to save user interaction
 * events directly to Neon PostgreSQL database.
 */
export function trackInteraction(params: TrackEventParams): void {
  try {
    if (typeof window === "undefined") return;

    const payload = {
      ...params,
      pagePath: params.pagePath || window.location.pathname,
      deviceType: window.innerWidth <= 640 ? "mobile" : window.innerWidth <= 1024 ? "tablet" : "desktop"
    };

    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });

    // Use sendBeacon if available for instant non-blocking delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", blob);
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch((err) => console.warn("Track failed:", err));
    }
  } catch (e) {
    // Non-blocking catch
    console.debug("Track event error:", e);
  }
}
