import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from './db';

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[OTP] To: ${email}  Code: ${otp}  Type: ${type}`);
      },
    }),
    sveltekitCookies(getRequestEvent),
  ],
  schema: {
    user: {
      isGuest: {
        type: 'boolean',
        defaultValue: false,
        input: false,
      },
      deviceToken: {
        type: 'string',
        nullable: true,
        input: false,
      },
    },
  },
});
