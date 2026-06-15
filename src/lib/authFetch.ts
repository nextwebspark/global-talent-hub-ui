import { getAccessToken } from "./token";
import { apiUrl } from "./apiBase";

// Install a global fetch wrapper that (1) routes /api paths to the configured
// backend base URL (apiUrl) and (2) attaches the app's Bearer token to those
// requests. Centralizes both concerns so the ~70 existing fetch call sites and
// queryClient's apiRequest/getQueryFn don't each need editing. EventSource is
// handled separately (it can't send headers — see useSearchStream / api/search).
let installed = false;

export function installAuthFetch(): void {
  if (installed) return;
  installed = true;

  const original = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const isApi = url.startsWith("/api") || url.startsWith(`${window.location.origin}/api`);
    if (!isApi) return original(input, init);

    // Route to the configured backend base (no-op when VITE_API_URL is unset).
    const target = apiUrl(url);

    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (!headers.has("Authorization")) {
      const token = getAccessToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }

    // Pass the rewritten URL as a string. When the original input was a Request,
    // reconstruct it against the new URL so method/body/etc. are preserved.
    if (typeof input === "string" || input instanceof URL) {
      return original(target, { ...init, headers });
    }
    return original(new Request(target, input), { ...init, headers });
  };
}
