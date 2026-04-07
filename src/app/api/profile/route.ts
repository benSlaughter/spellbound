import { NextRequest, NextResponse } from "next/server";
import { getProfile, updateProfileName } from "@/lib/db";
import { checkAdminAuth, checkCSRF, validateStringInput } from "@/lib/auth";

interface ProfileRow {
  id: number;
  name: string;
  avatar: string;
}

/** GET /api/profile — returns the default profile (public, no auth needed) */
export async function GET() {
  try {
    const profile = getProfile(1) as ProfileRow | undefined;
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ id: profile.id, name: profile.name, avatar: profile.avatar });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

/** PUT /api/profile — update profile name (admin only) */
export async function PUT(request: NextRequest) {
  try {
    if (!checkCSRF(request)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 403 });
    }

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body as { name: string };

    const nameCheck = validateStringInput(name, 50, "Name");
    if (!nameCheck.valid) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }

    updateProfileName(1, nameCheck.value);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
