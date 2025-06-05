export function hasPRLink(migration: string) {
  return migration.trim().toLocaleLowerCase().includes('https://github.com/')
}
