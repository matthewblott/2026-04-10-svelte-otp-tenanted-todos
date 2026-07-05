export function otpTemplate(code: string, tenantName: string): string {
  return `
    <p>Your one-time login code for <strong>${tenantName}</strong>:</p>
    <h2 style="letter-spacing: 0.2em;">${code}</h2>
    <p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
  `;
}
