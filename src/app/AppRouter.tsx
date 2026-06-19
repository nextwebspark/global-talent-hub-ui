/**
 * Application routes (authenticated).
 *
 * User journey:
 *   Landing (search) → Universe (review results) → Dashboard (map / table / export)
 *
 * Project-scoped routes: /:projectId/dashboard, /:projectId/universe/:universeId
 * Global routes: /, /projects, /settings
 */
import { Switch, Route, Redirect } from 'wouter';
import LandingPage from '@/features/landing/LandingPage';
import UniversePage from '@/features/universe/UniversePage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import SettingsPage from '@/features/settings';
import NotFound from '@/app/NotFound';
import { legacyUniversePath } from '@/lib/dashboardView';

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/dashboard">{() => <Redirect to="/projects" />}</Route>
      <Route path="/universe/:searchQueryId">
        {(params) => <Redirect to={legacyUniversePath(params.searchQueryId)} />}
      </Route>
      <Route path="/:projectId/dashboard" component={DashboardPage} />
      <Route path="/:projectId/universe/:universeId" component={UniversePage} />
      <Route component={NotFound} />
    </Switch>
  );
}
