import * as v from 'valibot';

export const TodoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, 'Title is required'),
    v.maxLength(255, 'Title must be 255 characters or less'),
  ),
  description: v.optional(v.pipe(
    v.string(),
    v.maxLength(10000, 'Description is too long'),
  )),
});

export type TodoInput = v.InferInput<typeof TodoSchema>;
