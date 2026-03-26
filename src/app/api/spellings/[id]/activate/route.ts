import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth, checkCSRF } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const listId = parseInt(id, 10);
    if (!Number.isInteger(listId) || listId < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const db = getDb();

    const list = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId) as { profile_id: number } | undefined;

    if (!list) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    db.transaction(() => {
      // Deactivate all lists for this profile
      db.prepare(
        "UPDATE spelling_lists SET is_active = 0 WHERE profile_id = ?"
      ).run(list.profile_id);
      // Activate the target list
      db.prepare("UPDATE spelling_lists SET is_active = 1 WHERE id = ?").run(
        listId
      );
    })();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to activate spelling list" },
      { status: 500 }
    );
  }
}
