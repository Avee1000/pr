// src/lib/url.ts
import { headers } from "next/headers";
import { env } from "./env";

/**
 * Resolves the canonical base URL for the current execution context.
 * 
 * 1. Active HTTP Request Context (Server Actions, Route Handlers, React Server Components):
 *    Inspects incoming proxy headers (`X-Forwarded-Host`, `Host`) to dynamically support 
 *    subdomains, edge regions, and preview branch URLs.
 * 
 * 2. Asynchronous Context (Background Queues, Cron Jobs, Worker Threads):
 *    Falls back strictly to the infrastructure-injected `env.APP_URL`.
 */
export async function getBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || (env.NODE_ENV === "development" ? "http" : "https");

    if (host) {
      return `${proto}://${host}`;
    }
  } catch {
    // Execution context is outside an active HTTP request (e.g., Background Job / Queue Worker)
  }

  return env.APP_URL;
}