import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getSetting } from "@/lib/db";
import { NextRequest } from "next/server";

/** Internal session representation stored in the in-memory session map. */
interface Session {
  /** The UUID session token */
  token: string;
  /** Timestamp (ms since epoch) when this session expires */
  expiresAt: number;
}

/** Name of the HTTP-only cookie used for admin sessions. */
const SESSION_COOKIE = "admin_session";
/** Session duration: 24 hours in milliseconds. */
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store (fine for a home server)
const sessions = new Map<string, Session>();

/**
 * Verify a plaintext password against the stored bcrypt hash.
 * Uses constant-time comparison to prevent timing attacks.
 * @param password - The plaintext password to verify
 * @returns True if the password matches the stored admin password
 */
export function verifyAdminPassword(password: string): boolean {
  const hashedPassword = getSetting("admin_password");
  // Always run bcrypt.compareSync to prevent timing attacks
  const dummyHash = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012";
  const hash = hashedPassword || dummyHash;
  const result = bcrypt.compareSync(password, hash);
  return hashedPassword ? result : false;
}

/**
 * Create a new admin session token and store it in the in-memory session map.
 * Cleans up expired sessions before creating a new one.
 * @returns The new UUID session token
 */
export function createSessionToken(): string {
  // Clean up expired sessions
  const now = Date.now();
  for (const [key, session] of sessions) {
    if (session.expiresAt < now) {
      sessions.delete(key);
    }
  }

  const token = uuidv4();
  sessions.set(token, {
    token,
    expiresAt: now + SESSION_DURATION_MS,
  });
  return token;
}

/**
 * Set the admin session cookie on the response.
 * @param token - The session token to store in the cookie
 */
export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/** Clear the admin session cookie from the response. */
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Check whether the current request has a valid admin session.
 * Reads the session cookie and validates it against the in-memory store.
 * @returns True if the request is authenticated as admin
 */
export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return false;

  const session = sessions.get(sessionCookie.value);
  if (!session) return false;

  if (session.expiresAt < Date.now()) {
    sessions.delete(sessionCookie.value);
    return false;
  }

  return true;
}

/**
 * Remove a session from the in-memory store, effectively logging out.
 * @param token - The session token to invalidate
 */
export function invalidateSession(token: string): void {
  sessions.delete(token);
}

/**
 * Get the current session token from the request cookies.
 * @returns The session token string, or undefined if not set
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * CSRF protection: verify Content-Type is application/json for state-changing requests.
 * GET, HEAD, and OPTIONS requests are always allowed.
 * @param request - The incoming Next.js request
 * @returns True if the request passes CSRF checks
 */
export function checkCSRF(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }
  const contentType = request.headers.get("content-type");
  return !!contentType && contentType.includes("application/json");
}

/**
 * Strip control characters from text input, preserving newlines.
 * Prevents injection of invisible characters.
 * @param input - The raw text input
 * @returns Sanitised text with control characters removed
 */
export function sanitizeText(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

/**
 * Validate that a value is a non-empty string within a max length, then sanitise it.
 * @param value - The value to validate (typically from request body)
 * @param maxLength - Maximum allowed string length
 * @param fieldName - Human-readable field name for error messages
 * @returns Object with `valid: true` and sanitised `value`, or `valid: false` and `error` message
 */
export function validateStringInput(
  value: unknown,
  maxLength: number,
  fieldName: string
): { valid: true; value: string } | { valid: false; error: string } {
  if (!value || typeof value !== "string") {
    return { valid: false, error: `${fieldName} is required and must be a string` };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  return { valid: true, value: sanitizeText(value) };
}
