import { PostHog } from "posthog-node";

/**
 * Returns a per-request PostHog Node client configured for short-lived server
 * contexts (Server Actions, Route Handlers). Always call `await client.flush()`
 * before the handler returns so queued events are sent before teardown.
 */
export function getPostHogClient(): PostHog {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!token) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
      );
    }
    // In production, return a no-op-like client so the app keeps running.
    // Events will fail to send but won't crash the server.
    return new PostHog("__missing__", { host: host ?? "https://us.i.posthog.com", flushAt: 1, flushInterval: 0 });
  }

  return new PostHog(token, {
    host: host ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}
