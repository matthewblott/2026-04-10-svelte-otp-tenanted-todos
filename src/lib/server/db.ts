import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

export const db = new Database(env.DATABASE_URL);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
