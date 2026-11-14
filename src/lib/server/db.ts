/**
 * Server-only SQLite storage (Node's built-in node:sqlite). File: ./data/grantai.db
 * Tables: users, sessions, user_data. For production, swap for a managed database with the same functions.
 */
import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DB_PATH = process.env.GRANTAI_DB_PATH || path.join(process.cwd(), "data", "grantai.db");

let db: DatabaseSync | null = null;

export function getDb() {
  if (db) return db;
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'student',
      pass_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT,
      progress TEXT,
      mock_history TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

export type UserRow = { id: number; email: string; name: string; role: string; pass_hash: string; created_at: string };
export type UserData = { plan: unknown; progress: Record<string, boolean>; mockHistory: unknown[]; updatedAt: string | null };

const parse = <X,>(v: unknown, fallback: X): X => {
  if (typeof v !== "string") return fallback;
  try {
    return JSON.parse(v) as X;
  } catch {
    return fallback;
  }
};

export function findUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

export function createUser(email: string, name: string, role: string, passHash: string) {
  const r = getDb().prepare("INSERT INTO users (email, name, role, pass_hash) VALUES (?, ?, ?, ?)").run(email, name, role, passHash);
  return Number(r.lastInsertRowid);
}

export function getUserData(userId: number): UserData {
  const row = getDb().prepare("SELECT plan, progress, mock_history, updated_at FROM user_data WHERE user_id = ?").get(userId) as
    | { plan: string | null; progress: string | null; mock_history: string | null; updated_at: string }
    | undefined;
  return {
    plan: parse(row?.plan, null),
    progress: parse(row?.progress, {}),
    mockHistory: parse(row?.mock_history, []),
    updatedAt: row?.updated_at ?? null,
  };
}

export function saveUserData(userId: number, patch: Partial<Pick<UserData, "plan" | "progress" | "mockHistory">>) {
  const cur = getUserData(userId);
  const next = {
    plan: patch.plan !== undefined ? patch.plan : cur.plan,
    progress: patch.progress !== undefined ? patch.progress : cur.progress,
    mockHistory: patch.mockHistory !== undefined ? patch.mockHistory : cur.mockHistory,
  };
  getDb()
    .prepare(
      `INSERT INTO user_data (user_id, plan, progress, mock_history, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET plan = excluded.plan, progress = excluded.progress, mock_history = excluded.mock_history, updated_at = excluded.updated_at`,
    )
    .run(userId, JSON.stringify(next.plan), JSON.stringify(next.progress), JSON.stringify(next.mockHistory));
  return getUserData(userId);
}

export function deleteUser(userId: number) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(userId);
}
