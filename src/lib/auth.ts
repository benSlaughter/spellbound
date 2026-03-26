import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { getSetting } from "@/lib/db";

interface Session {
  token: string;
  expiresAt: number;
}

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session store (fine for a home server)
const sessions = new Map<string, Session>();

export function verifyAdminPassword(password: string): boolean {
  const hashedPassword = getSetting("admin_password");
  if (!hashedPassword) return false;
  return bcrypt.compareSync(password, hashedPassword);
}

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

export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

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

export function invalidateSession(token: string): void {
  sessions.delete(token);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}
