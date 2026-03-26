import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { checkAdminAuth, checkCSRF, validateStringInput } from "@/lib/auth";

interface SpellingWord {
  word: string;
  hint?: string;
}

interface SpellingList {
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;
  archived: number;
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    let lists: SpellingList[];
    if (activeOnly) {
      lists = db
        .prepare(
          "SELECT * FROM spelling_lists WHERE is_active = 1 AND archived = 0 ORDER BY created_at DESC"
        )
        .all() as SpellingList[];
    } else {
      lists = db
        .prepare(
          "SELECT * FROM spelling_lists WHERE archived = 0 ORDER BY created_at DESC"
        )
        .all() as SpellingList[];
    }

    const listIds = lists.map((l) => l.id);
    let allWords: Array<{ list_id: number } & Record<string, unknown>> = [];
    if (listIds.length > 0) {
      const placeholders = listIds.map(() => "?").join(",");
      allWords = db
        .prepare(
          `SELECT * FROM spelling_words WHERE list_id IN (${placeholders}) ORDER BY id`
        )
        .all(...listIds) as Array<{ list_id: number } & Record<string, unknown>>;
    }

    const wordsByList = new Map<number, typeof allWords>();
    for (const word of allWords) {
      const bucket = wordsByList.get(word.list_id) ?? [];
      bucket.push(word);
      wordsByList.set(word.list_id, bucket);
    }

    const listsWithWords = lists.map((list) => ({
      ...list,
      words: wordsByList.get(list.id) ?? [],
    }));

    return NextResponse.json(listsWithWords);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch spelling lists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, words } = body as {
      name: string;
      words: SpellingWord[];
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

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "At least one word is required" },
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

    // Use default profile (id=1)
    const profileId = 1;

    const insertList = db.prepare(
      "INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)"
    );
    const insertWord = db.prepare(
      "INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)"
    );

    const result = db.transaction(() => {
      const listResult = insertList.run(profileId, nameCheck.value.trim());
      const listId = listResult.lastInsertRowid;

      for (const w of words) {
        if (w.word && w.word.trim()) {
          insertWord.run(listId, w.word.trim(), w.hint?.trim() || null);
        }
      }

      return listId;
    })();

    const newList = db
      .prepare("SELECT * FROM spelling_lists WHERE id = ?")
      .get(result) as Record<string, unknown>;
    const listWords = db
      .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
      .all(result);

    return NextResponse.json({ ...newList, words: listWords }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create spelling list" },
      { status: 500 }
    );
  }
}
