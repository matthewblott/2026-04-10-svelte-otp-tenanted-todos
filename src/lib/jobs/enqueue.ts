// src/lib/jobs/enqueue.ts
import { sharedDb } from '$lib/db/shared';
import { jobs } from '$lib/db/shared-schema';

export async function enqueue(
  type: string,
  payload: Record<string, unknown>,
  runAt?: Date,
): Promise<void> {
  await sharedDb.insert(jobs).values({ type, payload, runAt: runAt ?? new Date() });
}
