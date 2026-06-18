import { describe, expect, it } from 'vitest';
import { dashboardPath, legacyUniversePath, parseDashboardView, universePath } from '../dashboardView';

describe('parseDashboardView', () => {
  it('treats bare dashboard path as the analytics view', () => {
    expect(parseDashboardView('')).toBe('dashboard');
    expect(parseDashboardView('?foo=bar')).toBe('dashboard');
    expect(parseDashboardView('?view=dashboard')).toBe('dashboard');
  });

  it('reads map and table from query params', () => {
    expect(parseDashboardView('?view=map')).toBe('map');
    expect(parseDashboardView('?view=table')).toBe('table');
  });

  it('falls back to analytics for unknown values', () => {
    expect(parseDashboardView('?view=other')).toBe('dashboard');
  });
});

describe('dashboardPath', () => {
  it('builds project-scoped paths for each view', () => {
    expect(dashboardPath('42')).toBe('/42/dashboard');
    expect(dashboardPath('42', 'dashboard')).toBe('/42/dashboard');
    expect(dashboardPath('42', 'map')).toBe('/42/dashboard?view=map');
    expect(dashboardPath('42', 'table')).toBe('/42/dashboard?view=table');
  });

  it('encodes special characters in project ids', () => {
    expect(dashboardPath('a/b')).toBe('/a%2Fb/dashboard');
  });
});

describe('universePath', () => {
  it('builds project-scoped universe paths', () => {
    expect(universePath('42', 42)).toBe('/42/universe/42');
    expect(universePath('42', 99)).toBe('/42/universe/99');
  });
});

describe('legacyUniversePath', () => {
  it('maps old universe URLs to the new shape', () => {
    expect(legacyUniversePath('42')).toBe('/42/universe/42');
  });
});
