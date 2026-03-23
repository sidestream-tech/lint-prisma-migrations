import type { FlatKeyLocaleData, InvalidValueError, LocaleFileAnalysisResult, NamespaceConflict } from './types.js'

import { readFile } from 'node:fs/promises'

function isPlainJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Matches a JSON key declaration: optional whitespace, `"key":` (e.g. `  "expand.all": "value"`).
 * Note: does not handle escaped quotes within JSON keys (e.g. `"key\"name"`).
 */
const JSON_KEY_PATTERN = /^\s*"([^"]+)"\s*:/

/** Maps each JSON key to its 1-based line number by scanning the raw file content. */
function buildKeyLineMap(rawContent: string) {
  const lineMap = new Map<string, number>()
  const lines = rawContent.split('\n')

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]

    if (line === undefined) {
      continue
    }

    const match = line.match(JSON_KEY_PATTERN)

    if (match?.[1] !== undefined) {
      lineMap.set(match[1], lineIndex + 1)
    }
  }

  return lineMap
}

/** Validates that all values in a parsed locale object are strings. */
export function validateLocaleValues(data: Record<string, unknown>) {
  const validData: FlatKeyLocaleData = {}
  const invalidValues: InvalidValueError[] = []

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      validData[key] = value
    } else {
      invalidValues.push({
        key,
        actualType: Array.isArray(value) ? 'array' : typeof value,
      })
    }
  }

  return { validData, invalidValues }
}

/** Detects flat-key namespace conflicts where a key is both a leaf value and a prefix of another key. */
export function detectFlatKeyNamespaceConflicts(localeData: FlatKeyLocaleData) {
  const localeKeys = new Set(Object.keys(localeData))
  const conflicts: NamespaceConflict[] = []

  for (const key of localeKeys) {
    const segments = key.split('.')

    if (segments.length < 2) {
      continue
    }

    let prefix = segments[0] ?? ''

    for (let segmentIndex = 1; segmentIndex < segments.length; segmentIndex++) {
      if (localeKeys.has(prefix)) {
        conflicts.push({
          leafKey: prefix,
          conflictingDescendantKey: key,
        })
      }

      const segment = segments[segmentIndex]

      if (segment === undefined) {
        continue
      }

      prefix += `.${segment}`
    }
  }

  return conflicts
}

/** Reads, parses, and analyzes a single locale file for namespace conflicts and invalid values. */
export async function analyzeLocaleFile(filePath: string): Promise<LocaleFileAnalysisResult> {
  try {
    const content = await readFile(filePath, 'utf-8')
    const parsed: unknown = JSON.parse(content)

    if (!isPlainJsonObject(parsed)) {
      return { filePath, conflicts: [], invalidValues: [], error: 'File does not contain a JSON object' }
    }

    if (Object.keys(parsed).length === 0) {
      return { filePath, conflicts: [], invalidValues: [], error: 'File contains no translation keys' }
    }

    const { validData, invalidValues } = validateLocaleValues(parsed)

    const hasValidKeys = invalidValues.length < Object.keys(parsed).length
    const conflicts = hasValidKeys
      ? detectFlatKeyNamespaceConflicts(validData)
      : []

    if (invalidValues.length > 0 || conflicts.length > 0) {
      const keyLineMap = buildKeyLineMap(content)

      for (const invalidValue of invalidValues) {
        invalidValue.line = keyLineMap.get(invalidValue.key)
      }

      for (const conflict of conflicts) {
        conflict.leafKeyLine = keyLineMap.get(conflict.leafKey)
      }
    }

    return { filePath, conflicts, invalidValues }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { filePath, conflicts: [], invalidValues: [], error: message }
  }
}
