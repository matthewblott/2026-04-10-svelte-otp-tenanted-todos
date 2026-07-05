import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { safeParse } from 'valibot';
import { EmailSchema, VerifySchema } from '$lib/schemas/auth';
import { UsernameSchema } from '$lib/schemas/user';
import { flattenErrors } from '$lib/utils/validation';
import { createOtpRequest, verifyOtp, upgradeGuestAccount, changeUserEmail } from '$lib/auth/session';
import { sharedDb } from '$lib/db/shared';
import { users } from '$lib/db/shared-schema';
import { eq } from 'drizzle-orm';
import { enqueue } from '$lib/jobs/enqueue';
import { otpTemplate } from '$lib/email/templates/otp';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) redirect(302, '/');
  return {
    user:    locals.user,
    editing: url.searchParams.get('edit'),
  };
};

export const actions: Actions = {
  requestUpgrade: async ({ request, locals }) => {
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(EmailSchema, data);

    if (!result.success) {
      return fail(400, { step: 'request', errors: flattenErrors(result.issues), values: data });
    }

    const { email } = result.output;

    const existing = await sharedDb.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return fail(400, {
        step:   'request',
        errors: { email: 'That email is already linked to another account.' },
        values: data,
      });
    }

    const code = await createOtpRequest(email, 'upgrade');

    await enqueue('send-email', {
      to:      email,
      subject: 'Confirm your email address',
      html:    otpTemplate(code, 'your account'),
    });

    return { step: 'verify', email, action: 'upgrade' };
  },

  confirmUpgrade: async ({ request, locals }) => {
    const data  = Object.fromEntries(await request.formData());
    const email = String(data.email);
    const code  = String(data.code);

    const valid = await verifyOtp(email, code, 'upgrade');

    if (!valid) {
      return fail(400, { step: 'verify', email, action: 'upgrade', errors: { code: 'Invalid or expired code.' } });
    }

    await upgradeGuestAccount(locals.user!.id, email);

    const updated = await sharedDb.query.users.findFirst({
      where: eq(users.id, locals.user!.id),
    });

    redirect(302, `/${updated!.username}/settings?upgraded=1`);
  },

  changeUsername: async ({ request, locals }) => {
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(UsernameSchema, data);

    if (!result.success) {
      return fail(400, {
        action: 'changeUsername',
        errors: flattenErrors(result.issues),
        values: data,
      });
    }

    const { username } = result.output;

    if (username === locals.user!.username) {
      redirect(302, `/${username}/settings`);
    }

    const existing = await sharedDb.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existing) {
      return fail(400, {
        action: 'changeUsername',
        errors: { username: 'That username is already taken.' },
        values: data,
      });
    }

    await sharedDb.update(users)
      .set({ username })
      .where(eq(users.id, locals.user!.id));

    redirect(302, `/${username}/settings?renamed=1`);
  },

  requestEmailChange: async ({ request, locals }) => {
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(EmailSchema, data);

    if (!result.success) {
      return fail(400, {
        action: 'changeEmail',
        step:   'request',
        errors: flattenErrors(result.issues),
        values: data,
      });
    }

    const { email } = result.output;

    if (email === locals.user!.email) {
      return fail(400, {
        action: 'changeEmail',
        step:   'request',
        errors: { email: 'That is already your current email address.' },
        values: data,
      });
    }

    const existing = await sharedDb.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return fail(400, {
        action: 'changeEmail',
        step:   'request',
        errors: { email: 'That email is already linked to another account.' },
        values: data,
      });
    }

    const code = await createOtpRequest(email, 'change-email');

    await enqueue('send-email', {
      to:      email,
      subject: 'Confirm your new email address',
      html:    otpTemplate(code, 'your account'),
    });

    return { action: 'changeEmail', step: 'verify', email };
  },

  confirmEmailChange: async ({ request, locals }) => {
    const data  = Object.fromEntries(await request.formData());
    const email = String(data.email);
    const code  = String(data.code);

    const valid = await verifyOtp(email, code, 'change-email');

    if (!valid) {
      return fail(400, {
        action: 'changeEmail',
        step:   'verify',
        email,
        errors: { code: 'Invalid or expired code.' },
      });
    }

    await changeUserEmail(locals.user!.id, email);

    redirect(302, `/${locals.user!.username}/settings?email-changed=1`);
  },
};
