import nodemailer from 'nodemailer';
import {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,
} from '$env/static/private';

const transporter = nodemailer.createTransport({
  host:   SMTP_HOST,
  port:   Number(SMTP_PORT),
  secure: false,
  tls:    { rejectUnauthorized: false },
  auth:   SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});

export function sendMail(to: string, subject: string, html: string): Promise<void> {
  return transporter.sendMail({ from: SMTP_FROM, to, subject, html }).then(() => undefined);
}
