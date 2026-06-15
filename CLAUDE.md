# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Vite dev server → http://localhost:5173
npm run build            # production build → dist/
npm run preview          # serve the production build
npm run check            # tsc typecheck, no emit
npm run test:unit        # vitest run once
npm run test:unit:watch  # vitest watch
```

- Run a single test: `npx vitest run <path>` or `npx vitest run -t "<test name>"`.
- Tests live in `**/__tests__/**/*.test.{ts,tsx}`, jsdom environment.
- Node 22 required (`.nvmrc`). Package manager: npm (`package-lock.json`).
- No separate lint config — `npm run check` (tsc strict) is the type/quality gate.

## Architecture

Standalone React 19 + Vite **SPA** (not Next.js), extracted from a monorepo. Talks to a separate Spring Boot backend over a configurable base URL.

**Routing** — client-side via **wouter** (`src/app/AppRouter.tsx`). `vercel.json` rewrites all non-`/api` paths → `index.html`.

**Boot chain** — `src/main.tsx` → `src/app/App.tsx` (installs global authFetch, wraps AppProviders + Gate) → `src/app/providers.tsx` (QueryClient, AuthProvider, Tooltip, Toaster) → `src/app/Gate.tsx` (auth guard: redirects to `/login` or `/signup`, gates the app behind an org check).

**Backend connection model (important)**
- Local dev: `VITE_API_URL` unset → relative `/api/*` → Vite dev proxy → Spring on `http://localhost:5001` (override with `VITE_DEV_API_PROXY`). Start the backend separately.
- Deployed: set `VITE_API_URL` at build time → app calls backend directly cross-origin (backend must CORS the `Authorization` header and the SSE routes).

**Global fetch wrapper** — `src/lib/authFetch.ts` monkeypatches `window.fetch` once on boot: rewrites `/api/*` to the backend base via `apiUrl()` (`src/lib/apiBase.ts`) and attaches `Authorization: Bearer` from `localStorage["gth_token"]`. Individual fetch / React Query call sites do **not** handle base URL or auth — don't re-add that logic.

**SSE is separate** — EventSource can't set headers, so streaming search passes the token as `?access_token=` query param. See `src/features/search/useSearchStream.ts` + `src/lib/api/search.ts` (`/api/search/enhanced-stream`). Event types: `search_created`, `intent_extracted`, `company_found`, `company_enriched`, `executive_found`, `search_complete`, `no_results`, `error`.

**State split**
- Auth context `src/lib/auth.tsx` — session / org / role / profile.
- Zustand `useAppStore()` (`src/lib/store/create.ts`) — the search session (companies, intent, activities, streaming phase); persists edits via PATCH to `/api/companies/{id}` and `/api/executives/{id}`.
- React Query (`src/lib/queryClient.ts`) — server data; infinite staleTime, no refetch-on-focus.

**Other**
- Mapbox token comes from backend `GET /api/config` — there is no client env var for it.
- Aliases: `@/*` → `src/*`, `@shared/*` → `shared/*` (tsconfig + vite). `shared/schema.ts` holds minimal shared types with no server deps.
- UI: shadcn/ui (new-york style) in `src/components/ui/`, Radix primitives, TailwindCSS v4 (`@tailwindcss/vite`, CSS-first — no `tailwind.config`), lucide icons. Notable libs: mapbox-gl + react-globe.gl + three (map/globe), xlsx (Excel export), @tanstack/react-table, recharts, react-hook-form + zod.
- Feature folders under `src/features/`: `auth`, `landing` (search entry), `universe` (results review), `dashboard` (map/table/export), `projects` (history), `settings`.

## Environment variables

- `VITE_API_URL` — backend base URL for deployed builds; leave unset for local dev.
- `VITE_DEV_API_PROXY` — dev proxy target (default `http://localhost:5001`).

## Working principles

1. **Think before coding** — Don't assume, don't hide confusion, surface tradeoffs. Ask when multiple interpretations exist.
2. **Simplicity first** — Minimal code that directly addresses the request. No features beyond what was asked; no abstractions for single-use code.
3. **Surgical changes** — Touch only what you must; clean up only your own mess. No drive-by refactors or style fixes in unrelated code unless asked.
4. **Goal-driven execution** — Turn the task into verifiable success criteria plus an explicit plan (e.g. write tests for invalid inputs, then make them pass).

Exception: trivial tasks — use judgment.
