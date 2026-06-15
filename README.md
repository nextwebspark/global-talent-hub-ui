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
npm run dev            # http://localhost:5173 → local Spring backend
npm run dev:cloud      # http://localhost:5173 → hosted Cloud Run backend
```

Two dev targets, switched by Vite mode — no file edits between runs:

- `npm run dev` — `VITE_API_URL` unset → relative `/api/*` proxied to the local
  backend (default `http://localhost:5001`; override with `VITE_DEV_API_PROXY`).
  Same-origin, no CORS. Start the Spring backend separately on that port.
- `npm run dev:cloud` — runs with `--mode cloud`, loading `.env.cloud` which sets
  `VITE_API_URL` to the hosted Cloud Run backend
  (`https://gth-api-586609281886.us-central1.run.app`). Calls go direct
  (cross-origin), so that backend must allow CORS for the `Authorization` header
  and the SSE search routes.

`.env.cloud` (committed — holds only the public backend URL, no secrets):
```
VITE_API_URL=https://gth-api-586609281886.us-central1.run.app
```
Keep `VITE_API_URL` **unset** in `.env.local` — `.env.local` loads in every mode
and would override `.env.cloud`.

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
