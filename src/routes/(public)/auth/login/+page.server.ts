import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { safeParse } from 'valibot';
import { EmailSchema } from '$lib/schemas/auth';
import { flattenErrors } from '$lib/utils/validation';
import { createOtpRequest, loginUser } from '$lib/auth/session';
import { sharedDb } from '$lib/db/shared';
import { users } from '$lib/db/shared-schema';
import { eq } from 'drizzle-orm';
import { enqueue } from '$lib/jobs/enqueue';
import { otpTemplate } from '$lib/email/templates/otp';

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user && !locals.user.isGuest) redirect(302, `/${locals.user.username}/todos`);
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(EmailSchema, data);

    if (!result.success) {
      return fail(400, { errors: flattenErrors(result.issues), values: data });
    }

    const { email } = result.output;

    const existing = await sharedDb.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!existing) {
      return fail(400, {
        errors: { email: 'No account found with that email. Would you like to create one?' },
        values: data,
      });
    }

    const code = await createOtpRequest(email, 'login');

    await enqueue('send-email', {
      to:      email,
      subject: 'Your login code',
      html:    otpTemplate(code, 'your account'),
    });

    redirect(302, `/auth/verify?email=${encodeURIComponent(email)}&type=login`);
  },
};
