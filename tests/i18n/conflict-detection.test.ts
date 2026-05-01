import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { analyzeLocaleFile, detectFlatKeyNamespaceConflicts, validateLocaleValues } from '../../src/i18n/rules/conflict-detection.js'

const fixturesPath = resolve(import.meta.dirname, 'fixtures')

describe('validateLocaleValues', () => {
  it('returns empty errors when all values are strings', () => {
    const { validData, invalidValues } = validateLocaleValues({
      greeting: 'Hello',
      farewell: 'Goodbye',
    })

    expect(invalidValues).toEqual([])
    expect(validData).toEqual({ greeting: 'Hello', farewell: 'Goodbye' })
  })

  it('catches non-string values', () => {
    const { validData, invalidValues } = validateLocaleValues({
      greeting: 'Hello',
      count: 42,
      enabled: true,
      items: [1, 2],
      meta: null,
    })

    expect(validData).toEqual({ greeting: 'Hello' })
    expect(invalidValues).toHaveLength(4)

    const types = invalidValues.map(error => [error.key, error.actualType])

    expect(types).toContainEqual(['count', 'number'])
    expect(types).toContainEqual(['enabled', 'boolean'])
    expect(types).toContainEqual(['items', 'array'])
    expect(types).toContainEqual(['meta', 'object'])
  })

  it('returns empty results for empty input', () => {
    const { validData, invalidValues } = validateLocaleValues({})

    expect(validData).toEqual({})
    expect(invalidValues).toEqual([])
  })
})

describe('detectFlatKeyNamespaceConflicts', () => {
  it('returns no conflicts for clean flat keys', () => {
    const result = detectFlatKeyNamespaceConflicts({
      'a.b': 'x',
      'c.d': 'y',
    })

    expect(result).toEqual([])
  })

  it('detects a single conflict', () => {
    const result = detectFlatKeyNamespaceConflicts({
      'expand': 'Expand',
      'expand.all': 'Expand All',
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      leafKey: 'expand',
      conflictingDescendantKey: 'expand.all',
    })
  })

  it('detects multiple conflicts across prefix chains', () => {
    const result = detectFlatKeyNamespaceConflicts({
      'a': '1',
      'a.b': '2',
      'a.b.c': '3',
    })

    expect(result).toHaveLength(3)

    const pairs = result.map(conflict => [conflict.leafKey, conflict.conflictingDescendantKey])

    expect(pairs).toContainEqual(['a', 'a.b'])
    expect(pairs).toContainEqual(['a', 'a.b.c'])
    expect(pairs).toContainEqual(['a.b', 'a.b.c'])
  })

  it('returns empty results for empty input', () => {
    const result = detectFlatKeyNamespaceConflicts({})

    expect(result).toEqual([])
  })

  it('returns no conflicts for keys without dots', () => {
    const result = detectFlatKeyNamespaceConflicts({
      hello: 'world',
      foo: 'bar',
    })

    expect(result).toEqual([])
  })

  it('detects conflicts in realistic locale data', () => {
    const result = detectFlatKeyNamespaceConflicts({
      'common.save': 'Save',
      'common.save.draft': 'Save Draft',
      'common.save.publish': 'Publish',
    })

    expect(result).toHaveLength(2)

    for (const conflict of result) {
      expect(conflict.leafKey).toBe('common.save')
    }
  })
})

describe('analyzeLocaleFile', () => {
  it('returns no conflicts for valid file', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'valid/en.json'))

    expect(result.conflicts).toEqual([])
    expect(result.error).toBeUndefined()
  })

  it('detects conflicts in conflicting file', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'conflicting/en.json'))

    expect(result.conflicts.length).toBeGreaterThan(0)
    expect(result.error).toBeUndefined()
  })

  it('returns invalid values for file with non-string values', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'invalid-values/en.json'))

    expect(result.conflicts).toEqual([])

    expect(result.invalidValues.length).toBeGreaterThan(0)

    const keys = result.invalidValues.map(error => error.key)

    expect(keys).toContain('count')
    expect(keys).toContain('enabled')
    expect(keys).toContain('items')
    expect(keys).toContain('meta')
  })

  it('attaches line numbers to invalid values', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'invalid-values/en.json'))

    const countError = result.invalidValues.find(error => error.key === 'count')

    expect(countError).toBeDefined()
    expect(countError?.line).toBe(3)
  })

  it('returns both invalid values and conflicts for mixed-errors file', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'mixed-errors/en.json'))

    expect(result.invalidValues.length).toBeGreaterThan(0)
    expect(result.conflicts.length).toBeGreaterThan(0)

    const invalidKeys = result.invalidValues.map(error => error.key)

    expect(invalidKeys).toContain('count')

    const conflictPairs = result.conflicts.map(conflict => [conflict.leafKey, conflict.conflictingDescendantKey])

    expect(conflictPairs).toContainEqual(['expand', 'expand.all'])
  })

  it('returns error for empty object', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'empty/empty.json'))

    expect(result.conflicts).toEqual([])
    expect(result.error).toBe('File contains no translation keys')
  })

  it('returns error for invalid JSON', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'invalid/broken.json'))

    expect(result.conflicts).toEqual([])
    expect(result.error).toBeDefined()
  })

  it('returns error for non-object JSON', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'non-flat/nested.json'))

    expect(result.conflicts).toEqual([])
    expect(result.error).toBe('File does not contain a JSON object')
  })

  it('returns error for nonexistent file', async () => {
    const result = await analyzeLocaleFile(resolve(fixturesPath, 'does-not-exist.json'))

    expect(result.conflicts).toEqual([])
    expect(result.error).toBeDefined()
  })
})
