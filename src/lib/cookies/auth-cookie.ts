// lib/auth-cookies.ts
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "fallback-secret-key-must-be-at-least-32-chars";

// Standardize cookie settings in one place
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};

function signPayload(token: string): string {
  const payload = `verified:${token}`;
  const hmac = createHmac("sha256", COOKIE_SECRET).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

/**
 * Sets a cryptographically signed cookie marking a quote token as verified.
 */
export async function setVerifiedQuoteCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const signedValue = signPayload(token);
  
  cookieStore.set(`quote_verified_${token}`, signedValue, BASE_COOKIE_OPTIONS);
}

/**
 * Validates whether the provided quote token has a valid, untampered verification cookie.
 */
export async function isQuoteVerified(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(`quote_verified_${token}`)?.value;

  if (!cookieValue) return false;

  const expectedSignedValue = signPayload(token);

  // Timing-safe comparison prevents timing-attack side channels
  const actualBuffer = Buffer.from(cookieValue);
  const expectedBuffer = Buffer.from(expectedSignedValue);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

/**
 * Clears the quote verification cookie (e.g. on logout or rejection).
 */
export async function clearVerifiedQuoteCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(`quote_verified_${token}`);
}