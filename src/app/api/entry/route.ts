import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, words } = body as {
      name: string;
      words: { word: string; hint?: string }[];
    };

    if (!name || typeof name !== "string" || !name.trim()) {
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

      const listResult = insertList.run(profileId, name.trim());
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
