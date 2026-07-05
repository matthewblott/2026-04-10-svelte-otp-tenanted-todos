// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sharedDb } from '$lib/db/shared';
import { users, sessions } from '$lib/db/shared-schema';
import { getUserDb } from '$lib/db/app';
import { eq, and, gt } from 'drizzle-orm';
import { startWorker } from '$lib/jobs/worker';

startWorker();

export const handle: Handle = async ({ event, resolve }) => {
  // Resolve tenant (username) from URL if present
  const username = event.params.tenant;

  if (username) {
    const user = await sharedDb.query.users.findFirst({
      where: eq(users.username, username),
    });
    if (!user) return new Response('Not found', { status: 404 });
    event.locals.tenant = user;
  }

  // Resolve session
  const token = event.cookies.get('session');

  if (token) {
    const session = await sharedDb.query.sessions.findFirst({
      where: and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())),
      with:  { user: true },
    });

    if (session) {
      event.locals.user   = session.user;
      event.locals.userDb = getUserDb(session.user.id);
    }
  }

  return resolve(event);
};
