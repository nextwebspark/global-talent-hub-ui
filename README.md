# Global Talent Hub — UI

React + Vite client for Global Talent Hub. Talks to a Spring Boot backend over a
configurable base URL. Extracted from the original monorepo (server now lives in
a separate Spring Boot project).

## Requirements
- Node 22 (`.nvmrc` → `nvm use`)

## Setup
```bash
npm install
cp .env.example .env   # leave VITE_API_URL empty for local dev
```

## Develop
```bash
npm run dev            # http://localhost:5173
```
With `VITE_API_URL` unset, `/api/*` requests are proxied to the local backend
(default `http://localhost:5001`; override with `VITE_DEV_API_PROXY`). Start the
Spring backend separately on that port.

## Backend connection model
- **Local dev:** `VITE_API_URL` unset → relative `/api` paths → Vite dev proxy.
- **Deployed:** set `VITE_API_URL=https://<your-backend>` at build time → the app
  calls the backend directly (cross-origin; backend must allow CORS incl. the
  `Authorization` header and the SSE search routes).
- Auth: JWT in `localStorage["gth_token"]`, attached as `Authorization: Bearer`
  to every `/api` fetch by `src/lib/authFetch.ts`. SSE routes pass the token as
  `?access_token=` (EventSource can't set headers).
- Mapbox token is supplied by the backend via `GET /api/config` — no client env var.

## Build & preview
```bash
npm run build          # → dist/
npm run preview        # serve the production build
```

## Quality
```bash
npm run check          # tsc, no emit
npm run test:unit      # vitest
```

## Layout
- `src/` — app code (`app/`, `features/`, `components/`, `lib/`, `hooks/`, `types/`)
- `shared/` — minimal shared types (`@shared/*`), no server deps
- `src/lib/apiBase.ts` — API base URL resolver (`apiUrl()`)
