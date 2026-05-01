import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { findJsonFilesRecursively } from '../../src/i18n/rules/file-discovery.js'

const fixturesPath = resolve(import.meta.dirname, 'fixtures')

describe('findJsonFilesRecursively', () => {
  it('finds JSON files in a flat directory', async () => {
    const files = await findJsonFilesRecursively(resolve(fixturesPath, 'valid'))

    expect(files).toHaveLength(2)
    expect(files.every(file => file.endsWith('.json'))).toBe(true)
  })

  it('finds JSON files in nested directories', async () => {
    const files = await findJsonFilesRecursively(resolve(fixturesPath, 'nested-dirs'))

    expect(files).toHaveLength(2)
    expect(files.some(file => file.includes('shop'))).toBe(true)
    expect(files.some(file => file.includes('customer'))).toBe(true)
  })

  it('returns sorted paths', async () => {
    const files = await findJsonFilesRecursively(resolve(fixturesPath, 'nested-dirs'))
    const sorted = [...files].sort()

    expect(files).toEqual(sorted)
  })

  it('throws for nonexistent directory', async () => {
    await expect(
      findJsonFilesRecursively(resolve(fixturesPath, 'does-not-exist')),
    ).rejects.toThrow()
  })
})
