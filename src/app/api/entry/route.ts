import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkCSRF, validateStringInput } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!checkCSRF(request)) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, words } = body as {
      name: string;
      words: { word: string; hint?: string }[];
    };

    const nameCheck = validateStringInput(name, 200, "List name");
    if (!nameCheck.valid) {
      return NextResponse.json({ error: nameCheck.error }, { status: 400 });
    }
    if (!nameCheck.value.trim()) {
      return NextResponse.json(
        { error: "List name is required" },
        { status: 400 }
      );
    }

    if (!words || !Array.isArray(words) || words.length < 3) {
      return NextResponse.json(
        { error: "At least 3 words are required" },
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

    const db = getDb();
    const profileId = 1;

    const insertList = db.prepare(
      "INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)"
    );
    const insertWord = db.prepare(
      "INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
    );

    const listId = db.transaction(() => {
      // Deactivate all existing lists
      db.prepare(
        "UPDATE spelling_lists SET is_active = 0 WHERE profile_id = ?"
      ).run(profileId);

      const listResult = insertList.run(profileId, nameCheck.value.trim());
      const newId = listResult.lastInsertRowid;

      // Activate the new list
      db.prepare("UPDATE spelling_lists SET is_active = 1 WHERE id = ?").run(
        newId
      );

      for (const w of words) {
        if (w.word && w.word.trim()) {
          insertWord.run(newId, w.word.trim().toLowerCase(), w.hint?.trim() || null);
        }
      }

      return newId;
    })();

    const newList = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(listId) as Record<string, unknown>;
    const listWords = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(listId);

    return NextResponse.json({ ...newList, words: listWords }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save spelling words" },
      { status: 500 }
    );
  }
}
