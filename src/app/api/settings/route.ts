import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth, checkCSRF, validateStringInput } from "@/lib/auth";
import bcrypt from "bcryptjs";

interface SettingRow {
  key: string;
  value: string;
}

export async function GET() {
  try {
    const db = getDb();
    const settings = db.prepare("SELECT * FROM settings").all() as SettingRow[];

    const result: Record<string, string | boolean> = {};
    let hasPassword = false;

    for (const setting of settings) {
      if (setting.key === "admin_password") {
        hasPassword = !!setting.value;
      } else {
        result[setting.key] = setting.value;
      }
    }

    result.hasPassword = hasPassword;

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 403 }
      );
    }

    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body as { key: string; value: string };

    const keyCheck = validateStringInput(key, 50, "Setting key");
    if (!keyCheck.valid) {
      return NextResponse.json({ error: keyCheck.error }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: "Setting value is required" },
        { status: 400 }
      );
    }

    const valueStr = String(value);
    if (valueStr.length > 1000) {
      return NextResponse.json(
        { error: "Setting value must be at most 1000 characters" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Special action: reset all progress and achievements
    if (keyCheck.value === "reset_progress") {
      const profileId = 1;
      db.transaction(() => {
        db.prepare("DELETE FROM progress WHERE profile_id = ?").run(profileId);
        db.prepare("DELETE FROM achievements WHERE profile_id = ?").run(profileId);
      })();
      return NextResponse.json({ success: true });
    }

    let finalValue = valueStr;
    if (keyCheck.value === "admin_password") {
      finalValue = bcrypt.hashSync(finalValue, 10);
    }

    db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).run(keyCheck.value, finalValue);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
