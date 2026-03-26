import { NextResponse } from "next/server";
import { clearAdminCookie, getSessionToken, invalidateSession } from "@/lib/auth";

export async function POST() {
  try {
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
