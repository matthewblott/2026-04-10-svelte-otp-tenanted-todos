// src/lib/jobs/worker.ts
import { sharedDb } from '$lib/db/shared';
import { jobs } from '$lib/db/shared-schema';
import { eq, lte, and } from 'drizzle-orm';
import { sendEmailHandler } from './handlers/send-email';

type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

const handlers: Record<string, JobHandler> = {
  'send-email': sendEmailHandler,
};

async function processJobs(): Promise<void> {
  const pending = await sharedDb.query.jobs.findMany({
    where: and(eq(jobs.status, 'pending'), lte(jobs.runAt, new Date())),
    limit: 10,
  });

  for (const job of pending) {
    await sharedDb.update(jobs)
      .set({ status: 'processing', attempts: job.attempts + 1 })
      .where(eq(jobs.id, job.id));

    try {
      const handler = handlers[job.type];
      if (!handler) throw new Error(`No handler for job type: ${job.type}`);
      await handler(job.payload);
      await sharedDb.update(jobs).set({ status: 'done' }).where(eq(jobs.id, job.id));
    } catch (err) {
      console.error(`Job ${job.id} (${job.type}) failed:`, err);
      await sharedDb.update(jobs).set({ status: 'failed' }).where(eq(jobs.id, job.id));
    }
  }
}

let started = false;

export function startWorker(): void {
  if (started) return;
  started = true;
  setInterval(() => { processJobs().catch(console.error); }, 5000);
  console.log('[worker] Job queue started');
}
