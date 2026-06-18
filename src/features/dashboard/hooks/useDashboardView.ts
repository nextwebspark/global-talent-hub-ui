import { useCallback, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { ViewMode } from '@/components/layout/Sidebar';
import { dashboardPath, parseDashboardView } from '@/lib/dashboardView';

/** Dashboard workspace view driven by `/:projectId/dashboard` and `?view=` query params. */
export function useDashboardView(projectId: string) {
  const [, navigate] = useLocation();
  const search = useSearch();

  const activeView = useMemo(() => parseDashboardView(search), [search]);

  const setActiveView = useCallback((view: ViewMode) => {
    navigate(dashboardPath(projectId, view));
  }, [navigate, projectId]);

  return { activeView, setActiveView };
}
