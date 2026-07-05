// src/lib/db/shared.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './shared-schema';
import { mkdirSync } from 'node:fs';

mkdirSync('storage', { recursive: true });

const sqlite = new Database('storage/shared.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const sharedDb = drizzle(sqlite, { schema });
