import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth } from "@/lib/auth";

interface SpellingWord {
  word: string;
  hint?: string;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const list = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(Number(id)) as Record<string, unknown> | undefined;

    if (!list) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    const words = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(Number(id));

    return NextResponse.json({ ...list, words });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch spelling list" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    const { name, words, is_active } = body as {
      name?: string;
      words?: SpellingWord[];
      is_active?: boolean;
    };

    const existing = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(Number(id));

    if (!existing) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    db.transaction(() => {
      if (name !== undefined) {
        db.prepare("UPDATE spelling_lists SET name = ? WHERE id = ?").run(
          name.trim(),
          Number(id)
        );
      }

      if (is_active !== undefined) {
        db.prepare("UPDATE spelling_lists SET is_active = ? WHERE id = ?").run(
          is_active ? 1 : 0,
          Number(id)
        );
      }

      if (words !== undefined) {
        // Replace all words
        db.prepare("DELETE FROM spelling_words WHERE list_id = ?").run(
          Number(id)
        );
        const insertWord = db.prepare(
          "INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
        );
        for (const w of words) {
          if (w.word && w.word.trim()) {
            insertWord.run(Number(id), w.word.trim(), w.hint?.trim() || null);
          }
        }
      }
    })();

    const updated = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(Number(id)) as Record<string, unknown>;
    const updatedWords = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(Number(id));

    return NextResponse.json({ ...updated, words: updatedWords });
  } catch {
    return NextResponse.json(
      { error: "Failed to update spelling list" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const existing = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(Number(id));

    if (!existing) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    db.transaction(() => {
      db.prepare("DELETE FROM spelling_words WHERE list_id = ?").run(
        Number(id)
      );
      db.prepare("DELETE FROM spelling_lists WHERE id = ?").run(Number(id));
    })();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete spelling list" },
      { status: 500 }
    );
  }
}
