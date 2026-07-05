import { sendMail } from '$lib/email/client';

interface SendEmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

export async function sendEmailHandler(payload: Record<string, unknown>): Promise<void> {
  const { to, subject, html } = payload as SendEmailPayload;
  await sendMail(to, subject, html);
}
