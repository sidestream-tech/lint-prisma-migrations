export function hasPRLink(migration: string) {
  return migration.trim().startsWith('-- https://github.com/')
}
