// Resolves the backend base URL for API calls.
//
// In local dev VITE_API_URL is unset → base is "" so paths stay relative and
// Vite's dev proxy (/api → Spring) handles routing. In deployed builds set
// VITE_API_URL (e.g. https://gth-api.up.railway.app) to hit the remote Spring
// backend directly (cross-origin).
//
// apiUrl() is applied centrally in authFetch (the global fetch wrapper) and on
// the two EventSource URLs, so individual call sites keep using "/api/...".

const RAW = import.meta.env.VITE_API_URL ?? "";

// Strip a single trailing slash so apiUrl("/api/x") never yields a double slash.
const BASE = RAW.replace(/\/$/, "");

export function getApiBase(): string {
  return BASE;
}

export function apiUrl(path: string): string {
  // Only rewrite app API paths; leave everything else (absolute URLs,
  // third-party endpoints, blob:, data:) untouched.
  if (BASE && path.startsWith("/api")) {
    return BASE + path;
  }
  return path;
}
