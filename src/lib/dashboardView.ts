import type { ViewMode } from '@/components/layout/Sidebar';

/** Parse `?view=` from a project dashboard URL. Bare path is the analytics view. */
export function parseDashboardView(search: string): ViewMode {
  const view = new URLSearchParams(search).get('view');
  if (view === 'map' || view === 'table') return view;
  return 'dashboard';
}

/** Build `/:projectId/dashboard` for a workspace view. */
export function dashboardPath(projectId: string, view: ViewMode = 'dashboard'): string {
  const base = `/${encodeURIComponent(projectId)}/dashboard`;
  if (view === 'dashboard') return base;
  return `${base}?view=${view}`;
}

/** Build `/:projectId/universe/:universeId`. */
export function universePath(projectId: string, universeId: string | number): string {
  return `/${encodeURIComponent(projectId)}/universe/${encodeURIComponent(String(universeId))}`;
}

/** Redirect target for legacy `/universe/:id` links. */
export function legacyUniversePath(searchQueryId: string): string {
  return universePath(searchQueryId, searchQueryId);
}
