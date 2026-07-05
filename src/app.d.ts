// src/app.d.ts
import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '$lib/db/shared-schema';
import type { getUserDb } from '$lib/db/app';

type User = InferSelectModel<typeof users>;

declare global {
  namespace App {
    interface Locals {
      tenant?: User;   // resolved from [tenant] param = username
      user?:   User;   // resolved from session cookie
      userDb?: ReturnType<typeof getUserDb>;
    }
  }
}

export {};
