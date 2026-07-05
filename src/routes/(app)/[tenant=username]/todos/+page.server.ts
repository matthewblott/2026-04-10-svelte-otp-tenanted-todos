import type { PageServerLoad } from './$types';
import { todos } from '$lib/db/app-schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const allTodos = await locals.userDb!.query.todos.findMany({
    orderBy: desc(todos.createdAt),
  });
  return { todos: allTodos };
};
