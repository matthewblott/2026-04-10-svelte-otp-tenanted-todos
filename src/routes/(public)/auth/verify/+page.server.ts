import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { safeParse } from 'valibot';
import { VerifySchema } from '$lib/schemas/auth';
import { flattenErrors } from '$lib/utils/validation';
import { verifyOtp, createAccount, loginUser, deleteSession } from '$lib/auth/session';

export const load: PageServerLoad = async ({ locals, url }) => {
  if (locals.user && !locals.user.isGuest) redirect(302, `/${locals.user.username}/todos`);
  return {
    email: url.searchParams.get('email') ?? '',
    type:  url.searchParams.get('type') === 'register' ? 'register' : 'login',
  };
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data   = Object.fromEntries(await request.formData());
    const type   = data.type === 'register' ? 'register' : 'login';
    const result = safeParse(VerifySchema, data);

    if (!result.success) {
      return fail(400, { errors: flattenErrors(result.issues), values: data });
    }

    const { email, code } = result.output;
    const valid           = await verifyOtp(email, code, type);

    if (!valid) {
      return fail(400, { errors: { code: 'Invalid or expired code.' }, values: data });
    }

    const outcome = type === 'register'
      ? await createAccount(email)
      : await loginUser(email);

    if (!outcome) {
      return fail(400, { errors: { code: 'Something went wrong. Please try again.' }, values: data });
    }

    // Clear any existing guest session before setting the new one
    const existingToken = cookies.get('session');
    if (existingToken) await deleteSession(existingToken);

    cookies.set('session', outcome.token, {
      httpOnly: true,
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 30,
    });

    redirect(302, `/${outcome.username}/todos`);
  },
};
