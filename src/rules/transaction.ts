export function hasTransactionWrapper(migration: string) {
  const trimmedContent = migration.trim().toLowerCase()

  const hasBeginStatement = trimmedContent.includes('begin;')
  const hasCommitStatement = trimmedContent.endsWith('commit;')

  return hasBeginStatement && hasCommitStatement
}
