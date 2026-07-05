import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { safeParse } from 'valibot';
import { TodoSchema } from '$lib/schemas/todo';
import { flattenErrors } from '$lib/utils/validation';
import { todos } from '$lib/db/app-schema';

export const load: PageServerLoad = async ({ locals }) => {
  return { user: locals.user! };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(TodoSchema, data);

    if (!result.success) {
      return fail(400, { errors: flattenErrors(result.issues), values: data });
    }

    const [todo] = await locals.userDb!
      .insert(todos)
      .values({
        title:       result.output.title,
        description: result.output.description ?? null,
      })
      .returning();

    redirect(302, `/${locals.user!.username}/todos/${todo.id}`);
  },
};
