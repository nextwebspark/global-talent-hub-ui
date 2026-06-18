import { describe, expect, it } from 'vitest';
import { formatProjectName } from '../projectName';

describe('formatProjectName', () => {
  it('adds origin-specific prefixes', () => {
    expect(formatProjectName('FMCG UAE', 'search', [])).toBe('Search: FMCG UAE');
    expect(formatProjectName('My list', 'import', [])).toBe('Import: My list');
    expect(formatProjectName('JD.pdf', 'brief', [])).toBe('Brief: JD.pdf');
  });

  it('appends numeric suffix when the prefixed name already exists', () => {
    expect(formatProjectName('FMCG UAE', 'search', ['Search: FMCG UAE'])).toBe('Search: FMCG UAE 1');
    expect(
      formatProjectName('FMCG UAE', 'search', ['Search: FMCG UAE', 'Search: FMCG UAE 1']),
    ).toBe('Search: FMCG UAE 2');
  });

  it('returns empty string for blank base names', () => {
    expect(formatProjectName('   ', 'search', [])).toBe('');
  });
});
