// src/lib/db/app.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './app-schema';
import { mkdirSync } from 'node:fs';

mkdirSync('storage/data', { recursive: true });

const connections = new Map<number, ReturnType<typeof drizzle<typeof schema>>>();

export function getUserDb(userId: number) {
  if (connections.has(userId)) return connections.get(userId)!;

  const sqlite = new Database(`storage/data/${userId}.db`);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  // Applies all pending migrations from the generated migration folder.
  // Safe to call on every open — already-applied migrations are skipped.
  migrate(db, { migrationsFolder: 'src/lib/db/migrations/app' });

  connections.set(userId, db);
  return db;
}
