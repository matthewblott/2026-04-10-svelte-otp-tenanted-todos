import type { Actions, PageServerLoad } from './$types';
import { fail, redirect, error } from '@sveltejs/kit';
import { safeParse } from 'valibot';
import { TodoSchema } from '$lib/schemas/todo';
import { flattenErrors } from '$lib/utils/validation';
import { todos } from '$lib/db/app-schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, params }) => {
  const id   = Number(params.id);
  const todo = await locals.userDb!.query.todos.findFirst({
    where: eq(todos.id, id),
  });

  if (!todo) error(404, 'Todo not found');

  return { todo, user: locals.user! };
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
    const id     = Number(params.id);
    const data   = Object.fromEntries(await request.formData());
    const result = safeParse(TodoSchema, data);

    if (!result.success) {
      return fail(400, { errors: flattenErrors(result.issues), values: data });
    }

    await locals.userDb!
      .update(todos)
      .set({
        title:       result.output.title,
        description: result.output.description ?? null,
        updatedAt:   new Date(),
      })
      .where(eq(todos.id, id));

    redirect(302, `/${locals.user!.username}/todos/${id}?saved=1`);
  },

  toggle: async ({ locals, params }) => {
    const id   = Number(params.id);
    const todo = await locals.userDb!.query.todos.findFirst({
      where: eq(todos.id, id),
    });

    if (!todo) error(404, 'Todo not found');

    await locals.userDb!
      .update(todos)
      .set({ completed: !todo.completed, updatedAt: new Date() })
      .where(eq(todos.id, id));

    redirect(302, `/${locals.user!.username}/todos/${id}`);
  },

  delete: async ({ locals, params }) => {
    const id = Number(params.id);

    await locals.userDb!
      .delete(todos)
      .where(eq(todos.id, id));

    redirect(302, `/${locals.user!.username}/todos`);
  },
};
