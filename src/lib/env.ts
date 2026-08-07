/**
 * The browser never talks to NestJS directly — every call goes through this app's server,
 * which is what lets the tokens stay in httpOnly cookies. So this URL is server-only and
 * deliberately not a NEXT_PUBLIC_ variable.
 *
 * Not marked with `server-only`: `proxy.ts` needs it too, and proxy sits outside that
 * module boundary.
 */
export const API_BASE_URL = (process.env.API_BASE_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);
