import type { ParamMatcher } from '@sveltejs/kit';

const RESERVED = new Set(['auth', 'api', 'admin', 'static', 'favicon.ico']);

export const match: ParamMatcher = (param) => {
  const reserved = RESERVED.has(param);
  const valid    = /^[a-z0-9_]{1,30}$/.test(param);
  console.log(`[matcher] param="${param}" reserved=${reserved} valid=${valid}`);
  return !reserved && valid;
};
