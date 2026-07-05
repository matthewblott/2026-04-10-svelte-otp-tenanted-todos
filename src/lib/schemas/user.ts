import * as v from 'valibot';

export const UsernameSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(2, 'Username must be at least 2 characters'),
    v.maxLength(30, 'Username must be 30 characters or less'),
    v.regex(/^[a-z0-9_]+$/, 'Username may only contain lowercase letters, numbers and underscores'),
  ),
});

export type UsernameInput = v.InferInput<typeof UsernameSchema>;
