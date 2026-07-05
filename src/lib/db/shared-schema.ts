// src/lib/db/shared-schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  username:    text('username').notNull().unique(),
  email:       text('email').unique(),
  deviceToken: text('device_token').unique(),
  isGuest:     integer('is_guest', { mode: 'boolean' }).notNull().default(false),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  userId:    integer('user_id').notNull().references(() => users.id),
  token:     text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const otpRequests = sqliteTable('otp_requests', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  email:     text('email').notNull(),
  type:      text('type', { enum: ['login', 'register', 'upgrade', 'change-email'] }).notNull().default('login'),
  codeHash:  text('code_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const jobs = sqliteTable('jobs', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  type:      text('type').notNull(),
  payload:   text('payload', { mode: 'json' }).$type<Record<string, unknown>>().notNull(),
  status:    text('status', { enum: ['pending', 'processing', 'done', 'failed'] }).notNull().default('pending'),
  runAt:     integer('run_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  attempts:  integer('attempts').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
