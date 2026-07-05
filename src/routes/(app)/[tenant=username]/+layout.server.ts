// src/routes/(app)/[tenant]/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/');
  
  // Prevent users accessing other tenants' routes
  if (locals.tenant && locals.user.id !== locals.tenant.id) {
    redirect(302, `/${locals.user.username}/todos`);
  }

  return { user: locals.user, tenant: locals.tenant };
};
