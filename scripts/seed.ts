import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as sharedSchema from '../src/lib/db/shared-schema.js';
import * as appSchema from '../src/lib/db/app-schema.js';
import { eq, and } from 'drizzle-orm';

mkdirSync('storage/data', { recursive: true });

const sharedSqlite = new Database('storage/shared.db');
sharedSqlite.pragma('journal_mode = WAL');
sharedSqlite.pragma('foreign_keys = ON');
const sharedDb = drizzle(sharedSqlite, { schema: sharedSchema });

function provisionUserDb(userId: number) {
  const sqlite = new Database(`storage/data/${userId}.db`);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema: appSchema });
  migrate(db, { migrationsFolder: 'src/lib/db/migrations/app' });
  return db;
}

function deriveUsername(email: string): string {
  return email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
}

const SEED_USERS = [
  {
    email:    'alice.acme-789@example.com',
    username: 'aliceacme',       // derived automatically in production
    todos:    ['Set up CI pipeline', 'Review Q4 roadmap', 'Write onboarding docs'],
  },
  {
    email:    'bob@example.com',
    username: 'bob',
    todos:    ['Update dependencies', 'Add error monitoring'],
  },
];

const { users } = sharedSchema;
const { todos }  = appSchema;

console.log('\n🌱 Seeding database...\n');

for (const userData of SEED_USERS) {
  const username = deriveUsername(userData.email);

  let user = await sharedDb.query.users.findFirst({ where: eq(users.email, userData.email) });

  if (user) {
    console.log(`  user already exists: ${userData.email} (@${username})`);
  } else {
    [user] = await sharedDb.insert(users)
      .values({ email: userData.email, username })
      .returning();
    console.log(`  created user: ${userData.email} → @${username} (id ${user.id})`);
  }

  const userDb         = provisionUserDb(user.id);
  const existingTodos  = await userDb.select().from(todos);

  if (existingTodos.length > 0) {
    console.log(`  todos already seeded for @${username}, skipping`);
  } else {
    for (const title of userData.todos) {
      await userDb.insert(todos).values({ title });
      console.log(`  todo: "${title}"`);
    }
  }
}

console.log('\n✅ Seed complete.\n');
console.log('Accounts:');
for (const u of SEED_USERS) {
  const username = deriveUsername(u.email);
  console.log(`  http://localhost:5173/${username}/todos  (${u.email})`);
}
console.log('');

sharedSqlite.close();
