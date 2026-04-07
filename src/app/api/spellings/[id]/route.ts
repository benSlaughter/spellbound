import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth, checkCSRF, validateStringInput } from "@/lib/auth";

interface SpellingWord {
  word: string;
  hint?: string;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);
    if (!Number.isInteger(listId) || listId < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const db = getDb();

    const list = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId) as Record<string, unknown> | undefined;

    if (!list) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    const words = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(listId);

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
    const body = await request.json();
    const { name, words, is_active } = body as {
      name?: string;
      words?: SpellingWord[];
      is_active?: boolean;
    };

    const existing = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId);

    if (!existing) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    // Validate name if provided
    let sanitizedName: string | undefined;
    if (name !== undefined) {
      const nameCheck = validateStringInput(name, 200, "List name");
      if (!nameCheck.valid) {
        return NextResponse.json({ error: nameCheck.error }, { status: 400 });
      }
      sanitizedName = nameCheck.value;
    }

    // Validate words if provided
    if (words !== undefined) {
      if (!Array.isArray(words)) {
        return NextResponse.json(
          { error: "Words must be an array" },
          { status: 400 }
        );
      }
      if (words.length > 50) {
        return NextResponse.json(
          { error: "Maximum 50 words per list" },
          { status: 400 }
        );
      }
      for (const w of words) {
        if (w.word) {
          const wordCheck = validateStringInput(w.word, 100, "Word");
          if (!wordCheck.valid) {
            return NextResponse.json({ error: wordCheck.error }, { status: 400 });
          }
        }
        if (w.hint) {
          const hintCheck = validateStringInput(w.hint, 500, "Hint");
          if (!hintCheck.valid) {
            return NextResponse.json({ error: hintCheck.error }, { status: 400 });
          }
        }
      }
    }

    db.transaction(() => {
      if (sanitizedName !== undefined) {
        db.prepare("UPDATE spelling_lists SET name = ? WHERE id = ?").run(
          sanitizedName.trim(),
          listId
        );
      }

      if (is_active !== undefined) {
        db.prepare("UPDATE spelling_lists SET is_active = ? WHERE id = ?").run(
          is_active ? 1 : 0,
          listId
        );
      }

      if (words !== undefined) {
        // Replace all words
        db.prepare("DELETE FROM spelling_words WHERE list_id = ?").run(
          listId
        );
        const insertWord = db.prepare(
          "INSERT OR IGNORE INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
        );
        for (const w of words) {
          if (w.word && w.word.trim()) {
            insertWord.run(listId, w.word.trim(), w.hint?.trim() || null);
          }
        }
      }
    })();

    const updated = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId) as Record<string, unknown>;
    const updatedWords = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(listId);

    return NextResponse.json({ ...updated, words: updatedWords });
  } catch {
    return NextResponse.json(
      { error: "Failed to update spelling list" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const existing = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId);

    if (!existing) {
      return NextResponse.json(
        { error: "Spelling list not found" },
        { status: 404 }
      );
    }

    db.transaction(() => {
      db.prepare("DELETE FROM spelling_words WHERE list_id = ?").run(
        listId
      );
      db.prepare("DELETE FROM spelling_lists WHERE id = ?").run(listId);
    })();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete spelling list" },
      { status: 500 }
    );
  }
}
