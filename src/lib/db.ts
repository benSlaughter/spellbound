import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

/** Path to the SQLite database file, configurable via SPELLBOUND_DB_PATH env var. */
const DB_PATH = process.env.SPELLBOUND_DB_PATH || path.join(process.cwd(), "data", "spellbound.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

let db: Database.Database | null = null;

/** Reset the cached database connection (used in tests). */
export function _resetDb(): void {
  if (db) {
    try { db.close(); } catch { /* already closed */ }
  }
  db = null;
}

/**
 * Get or create the SQLite database connection.
 * On first call, creates the data directory, initialises the schema,
 * and seeds default data (profile + admin password).
 * @returns The singleton database connection
 */
function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.SPELLBOUND_DB_PATH || DB_PATH;

  // Ensure the data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initSchema(db);
  seedDefaults(db);

  return db;
}

/** Execute the SQL schema file to create tables if they don't exist. */
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

/** Seed default profile ("Learner") and admin password ("spellbound123") if none exist. */
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

  // Seed default maths tables (all 1-12) if not already set
  database
    .prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)")
    .run("maths_tables", "1,2,3,4,5,6,7,8,9,10,11,12");
}

// --- Helper functions ---

/**
 * Get all user profiles, ordered by ID.
 * @returns Array of profile objects
 */
export function getProfiles() {
  return getDb().prepare("SELECT * FROM profiles ORDER BY id").all();
}

/**
 * Get a single profile by ID.
 * @param id - The profile ID
 * @returns The profile object, or undefined if not found
 */
export function getProfile(id: number) {
  return getDb().prepare("SELECT * FROM profiles WHERE id = ?").get(id);
}

/**
 * Create a new user profile.
 * @param name - Display name for the profile
 * @param avatar - Avatar identifier (default: "sprout")
 * @returns The new profile's row ID
 */
export function createProfile(name: string, avatar: string = "sprout") {
  const result = getDb()
    .prepare("INSERT INTO profiles (name, avatar) VALUES (?, ?)")
    .run(name, avatar);
  return result.lastInsertRowid;
}

/**
 * Get all spelling lists for a profile, excluding archived ones.
 * @param profileId - The profile ID to fetch lists for
 * @returns Array of spelling list objects, ordered by creation date descending
 */
export function getSpellingLists(profileId: number) {
  return getDb()
    .prepare(
      "SELECT * FROM spelling_lists WHERE profile_id = ? AND archived = 0 ORDER BY created_at DESC"
    )
    .all(profileId);
}

/**
 * Get a single spelling list by ID.
 * @param id - The spelling list ID
 * @returns The spelling list object, or undefined if not found
 */
export function getSpellingList(id: number) {
  return getDb().prepare("SELECT * FROM spelling_lists WHERE id = ?").get(id);
}

/**
 * Create a new spelling list for a profile.
 * @param profileId - The profile ID to associate the list with
 * @param name - Display name for the list (e.g. "Week 12")
 * @returns The new list's row ID
 */
export function createSpellingList(profileId: number, name: string) {
  const result = getDb()
    .prepare("INSERT INTO spelling_lists (profile_id, name) VALUES (?, ?)")
    .run(profileId, name);
  return result.lastInsertRowid;
}

/**
 * Set a spelling list as the active list for a profile.
 * Deactivates all other lists for that profile first.
 * @param profileId - The profile ID
 * @param listId - The list ID to activate
 */
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

/**
 * Get all words in a spelling list, ordered by ID.
 * @param listId - The spelling list ID
 * @returns Array of word objects (id, list_id, word, hint)
 */
export function getWordsForList(listId: number) {
  return getDb()
    .prepare("SELECT * FROM spelling_words WHERE list_id = ? ORDER BY id")
    .all(listId);
}

/**
 * Add a word to a spelling list.
 * @param listId - The spelling list ID
 * @param word - The spelling word
 * @param hint - Optional hint or clue (e.g. "a type of fruit")
 * @returns The new word's row ID
 */
export function addWord(listId: number, word: string, hint?: string) {
  const result = getDb()
    .prepare("INSERT INTO spelling_words (list_id, word, hint) VALUES (?, ?, ?)")
    .run(listId, word, hint ?? null);
  return result.lastInsertRowid;
}

/**
 * Delete a word from a spelling list.
 * @param id - The word ID to remove
 */
export function removeWord(id: number) {
  getDb().prepare("DELETE FROM spelling_words WHERE id = ?").run(id);
}

/**
 * Record a learning activity result in the progress log.
 * @param profileId - The profile ID
 * @param activityType - Game identifier (e.g. "spelling_builder", "maths_bubbles")
 * @param activityRef - What was practised (e.g. "apple", "7x8")
 * @param result - Outcome: "correct", "helped", or "skipped"
 * @returns The database run result with lastInsertRowid
 */
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

/**
 * Get progress records for a profile, optionally filtered by activity type.
 * @param profileId - The profile ID
 * @param activityType - Optional filter (e.g. "spelling_builder")
 * @returns Array of progress records, ordered by creation date descending
 */
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

/**
 * Get all unlocked achievements for a profile, ordered by unlock time.
 * @param profileId - The profile ID
 * @returns Array of achievement records (id, profile_id, achievement_key, unlocked_at)
 */
export function getAchievements(profileId: number) {
  return getDb()
    .prepare(
      "SELECT * FROM achievements WHERE profile_id = ? ORDER BY unlocked_at"
    )
    .all(profileId);
}

/**
 * Unlock an achievement for a profile. Uses INSERT OR IGNORE to prevent duplicates.
 * @param profileId - The profile ID
 * @param achievementKey - The achievement's unique key (e.g. "first_sprout")
 * @returns The database run result
 */
export function unlockAchievement(profileId: number, achievementKey: string) {
  return getDb()
    .prepare(
      "INSERT OR IGNORE INTO achievements (profile_id, achievement_key) VALUES (?, ?)"
    )
    .run(profileId, achievementKey);
}

/**
 * Get a setting value by key.
 * @param key - The setting key (e.g. "admin_password")
 * @returns The setting value, or undefined if not found
 */
export function getSetting(key: string): string | undefined {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

/**
 * Set a setting value, creating or updating as needed (upsert).
 * @param key - The setting key
 * @param value - The setting value
 */
export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
    .run(key, value);
}

export { getDb };
