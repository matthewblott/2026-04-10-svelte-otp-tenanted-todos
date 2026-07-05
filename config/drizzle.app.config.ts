import type { Config } from 'drizzle-kit';

export default {
  schema:        './src/lib/db/app-schema.ts',
  out:           './src/lib/db/migrations/app',
  dialect:       'sqlite',
  dbCredentials: { url: 'storage/template.db' },
} satisfies Config;
