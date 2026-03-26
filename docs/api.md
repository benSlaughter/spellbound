# SpellBound API Reference

All endpoints return JSON. State-changing requests (POST, PUT, DELETE) must include `Content-Type: application/json`.

**Base URL:** `http://localhost:3000/api`

**Authentication:** Some endpoints require admin authentication. Log in via `POST /api/admin/login` to receive a session cookie. Admin endpoints return `401 Unauthorized` without a valid session.

**Profile:** Most data endpoints operate on profile ID `1` (the default profile).

---

## Table of Contents

- [Admin](#admin)
  - [POST /api/admin/login](#post-apiadminlogin)
  - [GET /api/admin/login](#get-apiadminlogin)
  - [POST /api/admin/logout](#post-apiadminlogout)
- [Spelling Lists](#spelling-lists)
  - [GET /api/spellings](#get-apispellings)
  - [POST /api/spellings](#post-apispellings)
  - [GET /api/spellings/:id](#get-apispellingsid)
  - [PUT /api/spellings/:id](#put-apispellingsid)
  - [DELETE /api/spellings/:id](#delete-apispellingsid)
  - [POST /api/spellings/:id/activate](#post-apispellingsidactivate)
- [Child Word Entry](#child-word-entry)
  - [POST /api/entry](#post-apientry)
- [Progress](#progress)
  - [GET /api/progress](#get-apiprogress)
  - [POST /api/progress](#post-apiprogress)
- [Achievements](#achievements)
  - [GET /api/achievements](#get-apiachievements)
  - [POST /api/achievements](#post-apiachievements)
- [Settings](#settings)
  - [GET /api/settings](#get-apisettings)
  - [PUT /api/settings](#put-apisettings)
- [Maths Tables Config](#maths-tables-config)
  - [GET /api/maths/tables](#get-apimathstables)
- [Feedback](#feedback)
  - [POST /api/feedback](#post-apifeedback)
  - [GET /api/feedback](#get-apifeedback)
- [Unlocks](#unlocks)
  - [GET /api/unlocks](#get-apiunlocks)

---

## Admin

### POST /api/admin/login

Log in to the admin area. Sets an HTTP-only session cookie on success.

**Auth required:** No

**Request body:**
```typescript
{
  password: string
}
```

**Success response (200):**
```json
{ "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "Password is required" }` | Missing or empty password |
| 401 | `{ "error": "Invalid password" }` | Wrong password |
| 403 | `{ "error": "Invalid content type" }` | Missing `Content-Type: application/json` |
| 429 | `{ "error": "Too many login attempts. Please try again later." }` | Rate limit exceeded |
| 500 | `{ "error": "Internal server error" }` | Server error |

**Notes:**
- Login attempts are rate-limited to prevent brute force attacks
- Sessions last 24 hours
- Sessions are stored in memory — they are lost on server restart

---

### GET /api/admin/login

Check whether the current request is authenticated as admin.

**Auth required:** No (it reports auth status)

**Success response (200):**
```json
{ "authenticated": true }
```
or
```json
{ "authenticated": false }
```

---

### POST /api/admin/logout

Log out of the admin area. Clears the session cookie.

**Auth required:** No (clears any existing session)

**Request body:** None

**Success response (200):**
```json
{ "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Internal server error" }` | Server error |

---

## Spelling Lists

### GET /api/spellings

Fetch all spelling lists for the default profile.

**Auth required:** No

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `active` | `"true"` | If set, returns only the currently active list |

**Success response (200):**
```typescript
SpellingList[] // each with embedded words

// SpellingList shape:
{
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;       // 0 or 1
  archived: number;        // 0 or 1
  words: {
    id: number;
    list_id: number;
    word: string;
    hint: string | null;
  }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Failed to fetch spelling lists" }` | Server error |

---

### POST /api/spellings

Create a new spelling list with words. Admin only.

**Auth required:** Yes

**Request body:**
```typescript
{
  name: string;                           // max 200 chars
  words: { word: string; hint?: string }[];  // word max 100 chars, hint max 500 chars
}
```

**Success response (201):**
```typescript
{
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;
  archived: number;
  words: { id: number; list_id: number; word: string; hint: string | null }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "..." }` | Validation errors (name too long, invalid words, etc.) |
| 401 | `{ "error": "Unauthorized" }` | Not logged in as admin |
| 403 | `{ "error": "Invalid content type" }` | Missing `Content-Type: application/json` |
| 500 | `{ "error": "Failed to create spelling list" }` | Server error |

---

### GET /api/spellings/:id

Fetch a single spelling list with its words.

**Auth required:** No

**URL parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | `number` | Spelling list ID |

**Success response (200):**
```typescript
{
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;
  archived: number;
  words: { id: number; list_id: number; word: string; hint: string | null }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 404 | `{ "error": "Spelling list not found" }` | Invalid ID |
| 500 | `{ "error": "Failed to fetch spelling list" }` | Server error |

---

### PUT /api/spellings/:id

Update a spelling list's name, words, or active status. Admin only.

**Auth required:** Yes

**URL parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | `number` | Spelling list ID |

**Request body (all fields optional):**
```typescript
{
  name?: string;                            // max 200 chars
  words?: { word: string; hint?: string }[];  // replaces all words
  is_active?: boolean;                       // activate/deactivate
}
```

**Success response (200):**
```typescript
{
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;
  archived: number;
  words: { id: number; list_id: number; word: string; hint: string | null }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "..." }` | Validation errors |
| 401 | `{ "error": "Unauthorized" }` | Not logged in as admin |
| 403 | `{ "error": "Invalid content type" }` | Missing JSON content type |
| 404 | `{ "error": "Spelling list not found" }` | Invalid ID |
| 500 | `{ "error": "Failed to update spelling list" }` | Server error |

**Notes:**
- When `words` is provided, all existing words are deleted and replaced
- When `is_active` is set to `true`, all other lists for the profile are deactivated

---

### DELETE /api/spellings/:id

Delete a spelling list and all its words. Admin only.

**Auth required:** Yes

**URL parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | `number` | Spelling list ID |

**Success response (200):**
```json
{ "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 401 | `{ "error": "Unauthorized" }` | Not logged in as admin |
| 403 | `{ "error": "Invalid content type" }` | Missing JSON content type |
| 404 | `{ "error": "Spelling list not found" }` | Invalid ID |
| 500 | `{ "error": "Failed to delete spelling list" }` | Server error |

---

### POST /api/spellings/:id/activate

Set a spelling list as the active list. Deactivates all other lists. Admin only.

**Auth required:** Yes

**URL parameters:**

| Param | Type | Description |
|---|---|---|
| `id` | `number` | Spelling list ID |

**Request body:** None

**Success response (200):**
```json
{ "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 401 | `{ "error": "Unauthorized" }` | Not logged in as admin |
| 404 | `{ "error": "Spelling list not found" }` | Invalid ID |
| 500 | `{ "error": "Failed to activate spelling list" }` | Server error |

---

## Child Word Entry

### POST /api/entry

Create a spelling list from the child entry page. Does not require admin auth — this is the kid-friendly word entry flow.

**Auth required:** No

**Request body:**
```typescript
{
  name: string;                             // list name
  words: { word: string; hint?: string }[];  // minimum 3 words
}
```

**Success response (201):**
```typescript
{
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  is_active: number;
  archived: number;
  words: { id: number; list_id: number; word: string; hint: string | null }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "List name is required" }` | Missing name |
| 400 | `{ "error": "At least 3 words are required" }` | Fewer than 3 words |
| 500 | `{ "error": "Failed to save spelling words" }` | Server error |

**Notes:**
- The created list is automatically associated with profile ID `1`
- Unlike `POST /api/spellings`, this does not require admin auth

---

## Progress

### GET /api/progress

Fetch progress statistics and recent activity for the default profile.

**Auth required:** No

**Success response (200):**
```typescript
{
  totalGamesPlayed: number;    // total progress records
  wordsPractised: number;      // spelling activity count
  mathsPractised: number;      // maths activity count
  recentActivity: {
    id: number;
    profile_id: number;
    activity_type: string;
    activity_ref: string | null;
    result: string;
    created_at: string;
  }[];
  streakDays: number;          // consecutive days with activity
  statsByType: {
    activity_type: string;
    total: number;
    correct: number;
  }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Failed to fetch progress" }` | Server error |

---

### POST /api/progress

Record a learning activity result.

**Auth required:** No

**Request body:**
```typescript
{
  activity_type: string;     // e.g. "spelling_builder", "maths_bubbles"
  activity_ref: string;      // e.g. "apple", "7x8"
  result: "correct" | "helped" | "skipped";
}
```

**Success response (200):**
```typescript
{ "id": number, "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "activity_type is required" }` | Missing activity_type |
| 400 | `{ "error": "result must be 'correct', 'helped', or 'skipped'" }` | Invalid result value |
| 500 | `{ "error": "Failed to record progress" }` | Server error |

**Notes:**
- `activity_ref` is a human-readable reference — the word being spelled, the maths question, etc.
- The `result` field is always one of three values: `correct`, `helped`, or `skipped`
- After recording progress, clients should call `POST /api/achievements` to check for newly unlocked badges

---

## Achievements

### GET /api/achievements

Fetch all achievements with their unlock status for the default profile.

**Auth required:** No

**Success response (200):**
```typescript
{
  key: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlocked_at: string | null;   // ISO datetime if unlocked
}[]
```

**Example response:**
```json
[
  {
    "key": "first_sprout",
    "title": "First Sprout",
    "description": "Completed first game",
    "emoji": "🌱",
    "unlocked": true,
    "unlocked_at": "2025-01-15 10:30:00"
  },
  {
    "key": "word_wizard",
    "title": "Word Wizard",
    "description": "Practised all words in a spelling list",
    "emoji": "🧙",
    "unlocked": false,
    "unlocked_at": null
  }
]
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Failed to fetch achievements" }` | Server error |

---

### POST /api/achievements

Recalculate achievements for the default profile. Checks all achievement conditions against current progress and unlocks any newly earned badges.

**Auth required:** No

**Request body:** None

**Success response (200):**
```typescript
{
  newlyUnlocked: {
    key: string;
    title: string;
    description: string;
    emoji: string;
  }[];
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Failed to check achievements" }` | Server error |

**Notes:**
- This endpoint is idempotent — calling it multiple times won't duplicate achievements
- Typically called immediately after `POST /api/progress`
- The client-side `recordProgress()` helper in `maths-helpers.ts` calls both endpoints

---

## Settings

### GET /api/settings

Fetch all app settings.

**Auth required:** No

**Success response (200):**
```typescript
{
  [key: string]: string | boolean;
  hasPassword: boolean;          // always included
}
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 500 | `{ "error": "Failed to fetch settings" }` | Server error |

**Notes:**
- The `admin_password` value is never returned — only `hasPassword: true/false`

---

### PUT /api/settings

Update a setting. Admin only.

**Auth required:** Yes

**Request body:**
```typescript
{
  key: string;
  value: string;
}
```

**Success response (200):**
```json
{ "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "Setting key is required" }` | Missing key |
| 400 | `{ "error": "Setting value is required" }` | Missing value |
| 401 | `{ "error": "Unauthorized" }` | Not logged in as admin |
| 500 | `{ "error": "Failed to update setting" }` | Server error |

**Special keys:**

| Key | Behaviour |
|---|---|
| `admin_password` | Value is bcrypt-hashed before storage |
| `reset_progress` | Clears all progress and achievements for profile 1 (value is ignored) |

---

## Maths Tables Config

### GET /api/maths/tables

Fetch the configured times tables and difficulty levels available for maths games.

**Auth required:** No

**Success response (200):**
```typescript
{
  tables: number[];          // e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  difficulties: string[];   // e.g. ["seedling", "sapling", "tree", "mighty_oak"]
}
```

**Notes:**
- Tables and difficulties are configured via the `maths_tables` and `maths_difficulties` keys in the settings table
- If no setting is configured, returns all tables (1–12) and all difficulties
- The settings are comma-separated strings (e.g. `"2,3,5,10"`)

---

## Feedback

### POST /api/feedback

Submit student feedback. No authentication required — this is the child-facing feedback form.

**Auth required:** No

**Request body:**
```typescript
{
  message: string;    // 1–1000 characters
}
```

**Success response (200):**
```typescript
{ "id": number, "success": true }
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 400 | `{ "error": "Message must be between 1 and 1000 characters" }` | Empty or too long |
| 403 | `{ "error": "Invalid request" }` | Failed CSRF check |
| 500 | `{ "error": "Failed to submit feedback" }` | Server error |

**Notes:**
- Messages are sanitised before storage
- CSRF protection is enforced via the `checkCSRF` helper

---

### GET /api/feedback

Fetch all student feedback. Admin only.

**Auth required:** Yes

**Success response (200):**
```typescript
{
  id: number;
  message: string;
  created_at: string;
}[]
```

**Error responses:**

| Status | Body | When |
|---|---|---|
| 401 | `{ "error": "Unauthorised" }` | Not logged in as admin |
| 500 | `{ "error": "Failed to fetch feedback" }` | Server error |

---

## Unlocks

### GET /api/unlocks

Fetch the game unlock status for the default profile. Returns total correct answers and which fun games are currently unlocked.

**Auth required:** No

**Success response (200):**
```typescript
{
  totalAnswers: number;       // total correct + helped answers
  unlockedGames: string[];    // e.g. ["/games/spotmatch"]
}
```

**Notes:**
- Counts progress records with result `correct` or `helped`
- Compares against the `requiredCorrect` threshold in each `GameUnlock` definition from `src/lib/unlocks.ts`
- If the count meets or exceeds the threshold, the game's `href` appears in `unlockedGames`

---

## Activity Types Reference

These are the standard `activity_type` values used in the progress system:

| Activity Type | Game |
|---|---|
| `spelling_builder` | Word Builder |
| `spelling_memory` | Memory Match |
| `spelling_missing` | Missing Letters |
| `spelling_scramble` | Word Scramble |
| `spelling_wordsearch` | Word Search |
| `maths_bubbles` | Number Bubbles |
| `maths_mountain` | Math Mountain |
| `maths_puzzle` | Puzzle Pieces |
| `maths_river` | Number River |
| `maths_explorer` | Times Table Explorer |
| `spelling_catcher` | Spell Catcher |
| `spelling_volcano` | Word Volcano |
| `spelling_wordal` | Wordal |
| `maths_maze` | Math Maze |
| `maths_cascade` | Number Cascade |
