import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { validate } from '../../src/i18n/validate.js'

const fixturesPath = resolve(import.meta.dirname, 'fixtures')

describe('i18n validate', () => {
  it('succeeds on clean files', async () => {
    const result = await validate(resolve(fixturesPath, 'valid'))

    expect(result.totalFilesAnalyzed).toBe(2)
    expect(result.totalConflictCount).toBe(0)
    expect(result.totalInvalidValueCount).toBe(0)
    expect(result.filesWithErrors.length).toBe(0)
  })

  it('detects conflicts', async () => {
    const result = await validate(resolve(fixturesPath, 'conflicting'))

    expect(result.totalConflictCount).toBeGreaterThan(0)
    expect(result.filesWithErrors.length).toBeGreaterThan(0)
  })

  it('detects invalid values', async () => {
    const result = await validate(resolve(fixturesPath, 'invalid-values'))

    expect(result.totalInvalidValueCount).toBeGreaterThan(0)
    expect(result.filesWithErrors.length).toBeGreaterThan(0)
  })

  it('reports skipped files for invalid JSON', async () => {
    const result = await validate(resolve(fixturesPath, 'invalid'))

    expect(result.skippedResults.length).toBeGreaterThan(0)
  })

  it('throws when no JSON files found', async () => {
    await expect(
      validate(resolve(fixturesPath, 'empty-dir')),
    ).rejects.toThrow('No JSON files found')
  })

  it('reports both conflicts and invalid values for mixed-errors', async () => {
    const result = await validate(resolve(fixturesPath, 'mixed-errors'))

    expect(result.totalConflictCount).toBeGreaterThan(0)
    expect(result.totalInvalidValueCount).toBeGreaterThan(0)
  })
})
