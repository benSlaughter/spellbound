import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie, getSessionToken, invalidateSession, checkCSRF } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!checkCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 403 }
      );
    }

    const token = await getSessionToken();
    if (token) {
      invalidateSession(token);
    }
    await clearAdminCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
