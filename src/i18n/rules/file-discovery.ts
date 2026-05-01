import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

/** Recursively finds all `.json` files under a directory. */
export async function findJsonFilesRecursively(directoryPath: string) {
  const entries = await readdir(directoryPath, { withFileTypes: true, recursive: true })

  const jsonPaths: string[] = []

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      jsonPaths.push(join(entry.parentPath, entry.name))
    }
  }

  jsonPaths.sort()

  return jsonPaths
}
