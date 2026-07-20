"use client";

import { useEffect } from "react";

const SESSION_KEY = "partner_session_id";

function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function trackEvent(eventName: string, data: Record<string, unknown> = {}) {
  try {
    const sessionId = getSessionId();
    const url = new URL(window.location.href);
    await fetch("/api/track", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        eventName,
        path: url.pathname,
        referrer: document.referrer,
        utm: {
          source: url.searchParams.get("utm_source"),
          medium: url.searchParams.get("utm_medium"),
          campaign: url.searchParams.get("utm_campaign"),
          content: url.searchParams.get("utm_content"),
          term: url.searchParams.get("utm_term"),
        },
        data,
      }),
    });
  } catch {
    // Analytics must never block the funnel.
  }
}

export function getStoredSessionId() {
  return getSessionId();
}

export function TrackPage({ name = "page_view" }: { name?: string }) {
  useEffect(() => {
    void trackEvent(name);
  }, [name]);
  return null;
}
