// shared error flattener used in every action + component
import type { BaseIssue } from 'valibot';

export function flattenErrors(issues: BaseIssue<unknown>[]): Record<string, string> {
  return issues.reduce((acc, issue) => {
    const key = (issue.path?.[0] as { key?: string } | undefined)?.key ?? 'form';
    if (!acc[key]) acc[key] = issue.message;
    return acc;
  }, {} as Record<string, string>);
}
