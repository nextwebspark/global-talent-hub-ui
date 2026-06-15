// JWT storage for the app's own (Spring-issued) auth. Replaces Supabase.
// Token lives in localStorage and is attached as a Bearer header to /api calls
// (see authFetch) and as ?access_token= on the SSE route (EventSource can't set headers).
const KEY = "gth_token";

export function getAccessToken(): string | undefined {
  return localStorage.getItem(KEY) ?? undefined;
}

export function setAccessToken(token: string): void {
  localStorage.setItem(KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(KEY);
}
