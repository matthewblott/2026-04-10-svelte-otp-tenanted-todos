// drizzle.shared.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema:        './src/lib/db/shared-schema.ts',
  out:           './src/lib/db/migrations/shared',
  dialect:       'sqlite',
  dbCredentials: { url: 'storage/shared.db' },
} satisfies Config;
