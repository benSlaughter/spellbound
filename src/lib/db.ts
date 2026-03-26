import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "data", "spellbound.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  // Ensure the data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initSchema(db);
  seedDefaults(db);

  return db;
}

function initSchema(database: Database.Database): void {
  let schema: string;
  try {
    schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  } catch {
    // Fallback: resolve relative to this file's source location
    const altPath = path.join(process.cwd(), "src", "lib", "schema.sql");
    schema = fs.readFileSync(altPath, "utf-8");
  }
  database.exec(schema);
}

function seedDefaults(database: Database.Database): void {
  // Seed default profile if none exists
  const profileCount = database
    .prepare("SELECT COUNT(*) as count FROM profiles")
    .get() as { count: number };

  if (profileCount.count === 0) {
    database
      .prepare("INSERT INTO profiles (name, avatar) VALUES (?, ?)")
      .run("Learner", "sprout");
  }

  // Seed default settings if none exist
  const settingsCount = database
    .prepare("SELECT COUNT(*) as count FROM settings")
    .get() as { count: number };

  if (settingsCount.count === 0) {
    const hashedPassword = bcrypt.hashSync("spellbound123", 10);
    database
      .prepare("INSERT INTO settings (key, value) VALUES (?, ?)")
      .run("admin_password", hashedPassword);
  }
}

// --- Helper functions ---

export function getProfiles() {
  return getDb().prepare("SELECT * FROM profiles ORDER BY id").all();
}

export function getProfile(id: number) {
  return getDb().prepare("SELECT * FROM profiles WHERE id = ?").get(id);
}

export function createProfile(name: string, avatar: string = "sprout") {
  const result = getDb()
    .prepare("INSERT INTO profiles (name, avatar) VALUES (?, ?)")
    .run(name, avatar);
  return result.lastInsertRowid;
}

export function getSpellingLists(profileId: number) {
  return getDb()
    .prepare(
      "SELECT * FROM spelling_lists WHERE profile_id = ? AND archived = 0 ORDER BY created_at DESC"
    )
    .all(profileId);
}

export function getSpellingList(id: number) {
  return getDb().prepare("SELECT * FROM spelling_lists WHERE id = ?").get(id);
}

export function createSpellingList(profileId: number, name: string) {
  const result = getDb()
    .prepare("INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)")
    .run(profileId, name);
  return result.lastInsertRowid;
}

export function setActiveList(profileId: number, listId: number) {
  const database = getDb();
  database
    .prepare("UPDATE spelling_lists SET is_active = 0 WHERE profile_id = ?")
    .run(profileId);
  database
    .prepare(
      "UPDATE spelling_lists SET is_active = 1 WHERE id = ? AND profile_id = ?"
    )
    .run(listId, profileId);
}

export function getWordsForList(listId: number) {
  return getDb()
    .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
    .all(listId);
}

export function addWord(listId: number, word: string, hint?: string) {
  const result = getDb()
    .prepare("INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)")
    .run(listId, word, hint ?? null);
  return result.lastInsertRowid;
}

export function removeWord(id: number) {
  getDb().prepare("DELETE FROM spelling_words WHERE id = ?").run(id);
}

export function recordProgress(
  profileId: number,
  activityType: string,
  activityRef: string | null,
  result: string
) {
  const stmt = getDb().prepare(
    "INSERT INTO progress (profile_id, activity_type, activity_ref, result) VALUES (?, ?, ?, ?)"
  );
  return stmt.run(profileId, activityType, activityRef, result);
}

export function getProgress(profileId: number, activityType?: string) {
  if (activityType) {
    return getDb()
      .prepare(
        "SELECT * FROM progress WHERE profile_id = ? AND activity_type = ? ORDER BY created_at DESC"
      )
      .all(profileId, activityType);
  }
  return getDb()
    .prepare(
      "SELECT * FROM progress WHERE profile_id = ? ORDER BY created_at DESC"
    )
    .all(profileId);
}

export function getAchievements(profileId: number) {
  return getDb()
    .prepare(
      "SELECT * FROM achievements WHERE profile_id = ? ORDER BY unlocked_at"
    )
    .all(profileId);
}

export function unlockAchievement(profileId: number, achievementKey: string) {
  return getDb()
    .prepare(
      "INSERT OR IGNORE INTO achievements (profile_id, achievement_key) VALUES (?, ?)"
    )
    .run(profileId, achievementKey);
}

export function getSetting(key: string): string | undefined {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export { getDb };
