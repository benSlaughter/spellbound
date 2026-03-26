import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupTestDbEnv, teardownTestDb } from '@/test/db-helper';

const dbPath = setupTestDbEnv('auth');

// Mock next/headers cookies
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mockGet,
    set: mockSet,
    delete: mockDelete,
  })),
}));

let auth: typeof import('@/lib/auth');
let db: typeof import('@/lib/db');

beforeEach(async () => {
  vi.resetModules();
  mockGet.mockReset();
  mockSet.mockReset();
  mockDelete.mockReset();

  // Re-set env before each re-import
  process.env.SPELLBOUND_DB_PATH = dbPath;
  db = await import('@/lib/db');
  auth = await import('@/lib/auth');
});

afterEach(() => {
  db._resetDb();
});

afterAll(() => {
  teardownTestDb(dbPath);
});

describe('verifyAdminPassword', () => {
  it('returns true for correct password', () => {
    expect(auth.verifyAdminPassword('spellbound123')).toBe(true);
  });

  it('returns false for wrong password', () => {
    expect(auth.verifyAdminPassword('wrong-password')).toBe(false);
  });

  it('always runs bcrypt (constant-time) even when no hash is stored', () => {
    // Remove the admin_password setting
    const database = db.getDb();
    database.prepare("DELETE FROM settings WHERE key = 'admin_password'").run();

    // Should still return false, not throw
    expect(auth.verifyAdminPassword('anything')).toBe(false);
  });
});

describe('createSessionToken', () => {
  it('returns a UUID string', () => {
    const token = auth.createSessionToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('returns unique tokens on each call', () => {
    const t1 = auth.createSessionToken();
    const t2 = auth.createSessionToken();
    expect(t1).not.toBe(t2);
  });
});

describe('setAdminCookie', () => {
  it('sets an httpOnly cookie with the token', async () => {
    await auth.setAdminCookie('test-token');
    expect(mockSet).toHaveBeenCalledWith(
      'admin_session',
      'test-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    );
  });
});

describe('checkAdminAuth', () => {
  it('returns false when no cookie is set', async () => {
    mockGet.mockReturnValue(undefined);
    const result = await auth.checkAdminAuth();
    expect(result).toBe(false);
  });

  it('returns false for an unknown session token', async () => {
    mockGet.mockReturnValue({ value: 'unknown-token' });
    const result = await auth.checkAdminAuth();
    expect(result).toBe(false);
  });

  it('returns true for a valid session token', async () => {
    const token = auth.createSessionToken();
    mockGet.mockReturnValue({ value: token });
    const result = await auth.checkAdminAuth();
    expect(result).toBe(true);
  });

  it('returns false for an expired session', async () => {
    const token = auth.createSessionToken();

    // Manually expire the session by advancing time
    vi.useFakeTimers();
    vi.advanceTimersByTime(25 * 60 * 60 * 1000); // 25 hours

    mockGet.mockReturnValue({ value: token });
    const result = await auth.checkAdminAuth();
    expect(result).toBe(false);

    vi.useRealTimers();
  });
});

describe('clearAdminCookie', () => {
  it('deletes the admin_session cookie', async () => {
    await auth.clearAdminCookie();
    expect(mockDelete).toHaveBeenCalledWith('admin_session');
  });
});

describe('invalidateSession', () => {
  it('removes a session so it is no longer valid', async () => {
    const token = auth.createSessionToken();
    mockGet.mockReturnValue({ value: token });

    expect(await auth.checkAdminAuth()).toBe(true);

    auth.invalidateSession(token);

    expect(await auth.checkAdminAuth()).toBe(false);
  });
});

describe('checkCSRF', () => {
  it('allows GET requests without content-type', () => {
    const req = new Request('http://localhost/api/test', { method: 'GET' });
    expect(auth.checkCSRF(req as never)).toBe(true);
  });

  it('rejects POST without application/json content-type', () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(auth.checkCSRF(req as never)).toBe(false);
  });

  it('allows POST with application/json content-type', () => {
    const req = new Request('http://localhost/api/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(auth.checkCSRF(req as never)).toBe(true);
  });
});

describe('validateStringInput', () => {
  it('rejects null/undefined values', () => {
    const result = auth.validateStringInput(null, 100, 'name');
    expect(result.valid).toBe(false);
  });

  it('rejects strings exceeding max length', () => {
    const result = auth.validateStringInput('a'.repeat(101), 100, 'name');
    expect(result.valid).toBe(false);
  });

  it('accepts valid strings', () => {
    const result = auth.validateStringInput('hello', 100, 'name');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value).toBe('hello');
    }
  });

  it('sanitizes control characters', () => {
    const result = auth.validateStringInput('hello\x00world', 100, 'name');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value).toBe('helloworld');
    }
  });
});
