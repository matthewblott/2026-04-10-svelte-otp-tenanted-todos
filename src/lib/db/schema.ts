import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const tenants = sqliteTable('tenants', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  slug:      text('slug').notNull().unique(),
  name:      text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const users = sqliteTable('users', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  email:     text('email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const sessions = sqliteTable('sessions', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  userId:    integer('user_id').notNull().references(() => users.id),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  token:     text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const otpRequests = sqliteTable('otp_requests', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  email:     text('email').notNull(),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  codeHash:  text('code_hash').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const todos = sqliteTable('todos', {
  id:        integer('id').primaryKey({ autoIncrement: true }),
  tenantId:  integer('tenant_id').notNull().references(() => tenants.id),
  userId:    integer('user_id').notNull().references(() => users.id),
  title:     text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
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

// Relations — required for Drizzle's relational query API
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  todos: many(todos),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant:   one(tenants, { fields: [users.tenantId], references: [tenants.id] }),
  sessions: many(sessions),
  todos:    many(todos),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user:   one(users,   { fields: [sessions.userId],   references: [users.id] }),
  tenant: one(tenants, { fields: [sessions.tenantId], references: [tenants.id] }),
}));

export const todosRelations = relations(todos, ({ one }) => ({
  tenant: one(tenants, { fields: [todos.tenantId], references: [tenants.id] }),
  user:   one(users,   { fields: [todos.userId],   references: [users.id] }),
}));
