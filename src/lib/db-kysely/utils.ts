import { fail } from "@sveltejs/kit";
import { capitalCase } from "change-case";

interface SqliteError extends Error {
  code?: string;
}

type DbResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; field?: string };

export async function dbAttempt<T>(query: PromiseLike<T>): Promise<DbResult<T>> {
  try {
    const data = await query;
    return { success: true, data };
  } catch (err) {
    const { message, field } = describeSqliteError(err as SqliteError);
    return { success: false, message, field };
  }
}

function describeSqliteError(err: SqliteError): { message: string; field?: string } {
  console.log(err.message);

  const msg = err.message ?? '';

  if (err.code === 'SQLITE_CONSTRAINT_NOTNULL') {
    const columnMatch = msg.match(/constraint failed:\s*\w+\.(\w+)/i);
    const field = columnMatch?.[1];
    return { message: field ? `${capitalCase(field)} is required.` : 'A required field is missing.', field };
  }
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    const columnMatch = msg.match(/constraint failed:\s*\w+\.(\w+)/i);
    const field = columnMatch?.[1];
    return { message: field ? `That ${capitalCase(field)} is already taken.` : 'That value already exists.', field };
  }
  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    const checkMatch = msg.match(/length\(["'`]?(\w+)["'`]?\)\s*between\s*(\d+)\s*and\s*(\d+)/i);
    const [, field, min, max] = checkMatch ?? [];
    return {
      message: field ? `${capitalCase(field)} must be between ${min} and ${max} characters.` : 'One of the values provided is not allowed.',
      field,
    };
  }
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return { message: 'This refers to something that does not exist.' };
  }

  return { message: 'Something went wrong saving this.' };
}

export function failWith<T extends Record<string, unknown>>(
  formValues: T,
  result: { message: string; field?: string }
) {
  return fail(400, { ...formValues, error: true, message: result.message, field: result.field });
}

