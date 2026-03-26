import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth, checkCSRF, sanitizeText } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!checkCSRF(request)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (message.length < 1 || message.length > 1000) {
      return NextResponse.json(
        { error: "Message must be between 1 and 1000 characters" },
        { status: 400 }
      );
    }

    const sanitised = sanitizeText(message);
    const db = getDb();
    const result = db
      .prepare("INSERT INTO feedback (message) VALUES (?)")
      .run(sanitised);

    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const db = getDb();
    const feedback = db
      .prepare("SELECT * FROM feedback ORDER BY created_at DESC")
      .all();

    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
