import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createSessionToken,
  setAdminCookie,
  checkAdminAuth,
  checkCSRF,
} from "@/lib/auth";

// Rate limiting: track failed login attempts per IP
const failedAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function cleanupExpiredAttempts() {
  const now = Date.now();
  for (const [ip, data] of failedAttempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS) {
      failedAttempts.delete(ip);
    }
  }
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    cleanupExpiredAttempts();

    if (!checkCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 403 }
      );
    }

    const ip = getClientIP(request);
    const now = Date.now();

    // Check rate limit
    const attempts = failedAttempts.get(ip);
    if (attempts) {
      if (now - attempts.firstAttempt > WINDOW_MS) {
        failedAttempts.delete(ip);
      } else if (attempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again later." },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      // Track failed attempt
      const current = failedAttempts.get(ip);
      if (current && now - current.firstAttempt <= WINDOW_MS) {
        current.count++;
      } else {
        failedAttempts.set(ip, { count: 1, firstAttempt: now });
      }

      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(ip);

    const token = createSessionToken();
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const authenticated = await checkAdminAuth();
    return NextResponse.json({ authenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
