import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { createGuestAccount } from '$lib/auth/session';

export const actions: Actions = {
  guest: async ({ cookies }) => {
    let deviceToken = cookies.get('device_token');

    if (!deviceToken) {
      deviceToken = randomBytes(32).toString('hex');
      cookies.set('device_token', deviceToken, {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        maxAge:   60 * 60 * 24 * 365 * 5,
      });
    }

    const { token, username } = await createGuestAccount(deviceToken);

    cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24 * 30,
    });

    redirect(302, `/${username}/todos`);
  },
};
