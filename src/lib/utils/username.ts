import { sharedDb } from '$lib/db/shared';
import { users } from '$lib/db/shared-schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

export function deriveUsername(email: string): string {
  const local = email.split('@')[0];
  return local.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export async function uniqueUsername(base: string): Promise<string> {
  let candidate = base;
  let counter   = 1;

  while (true) {
    const existing = await sharedDb.query.users.findFirst({
      where: eq(users.username, candidate),
    });
    if (!existing) return candidate;
    candidate = `${base}${counter++}`;
  }
}

export function guestUsername(): string {
  return randomBytes(4).toString('hex'); // e.g. "a3f7c2b1"
}
