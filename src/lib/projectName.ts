export type ProjectOrigin = 'search' | 'import' | 'brief';

const PREFIX: Record<ProjectOrigin, string> = {
  search: 'Search: ',
  import: 'Import: ',
  brief: 'Brief: ',
};

/** Build a display name with origin prefix, appending " 1", " 2", … when taken. */
export function formatProjectName(
  baseName: string,
  origin: ProjectOrigin,
  existingNames: readonly string[],
): string {
  const trimmed = baseName.trim();
  if (!trimmed) return trimmed;

  const prefixed = `${PREFIX[origin]}${trimmed}`;
  const existing = new Set(existingNames.map((n) => n.trim()));

  if (!existing.has(prefixed)) return prefixed;

  let suffix = 1;
  while (existing.has(`${prefixed} ${suffix}`)) suffix++;
  return `${prefixed} ${suffix}`;
}

export function existingNamesFromHistory(
  history: readonly { query: string }[] | undefined,
): string[] {
  return (history ?? []).map((item) => item.query);
}
