export function aggregateListingDirectories(
  sessionDirectories: readonly (string | undefined)[],
  savedDirectories: readonly string[],
  torrentDirectories: readonly string[],
): string[] {
  const directories = new Set<string>();

  for (const directory of [
    ...sessionDirectories,
    ...savedDirectories,
    ...torrentDirectories,
  ]) {
    if (directory) directories.add(directory);
  }

  return [...directories];
}
