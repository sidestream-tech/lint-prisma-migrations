export function hasPRLink(migration: string) {
  const trimmedContent = migration.trim()
  return trimmedContent.startsWith('-- https://github.com/') || trimmedContent.startsWith('-- PR: https://github.com/')
}
