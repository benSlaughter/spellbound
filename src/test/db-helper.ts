import path from 'path';
import fs from 'fs';

const TEST_DB_DIR = path.join(process.cwd(), 'data');

/**
 * Set up a test database with the given name.
 * Must be called BEFORE importing any module that uses db.ts.
 */
export function setupTestDbEnv(name: string): string {
  const dbPath = path.join(TEST_DB_DIR, `test-${name}.db`);
  if (!fs.existsSync(TEST_DB_DIR)) {
    fs.mkdirSync(TEST_DB_DIR, { recursive: true });
  }
  cleanupDbFiles(dbPath);
  process.env.SPELLBOUND_DB_PATH = dbPath;
  return dbPath;
}

export function cleanupDbFiles(dbPath: string): void {
  for (const suffix of ['', '-wal', '-shm']) {
    const file = dbPath + suffix;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

export function teardownTestDb(dbPath: string): void {
  cleanupDbFiles(dbPath);
  delete process.env.SPELLBOUND_DB_PATH;
}
