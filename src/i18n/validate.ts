import type { LocaleFileAnalysisResult } from './types.js'

import { analyzeLocaleFile } from './conflict-detection.js'
import { findJsonFilesRecursively } from './file-discovery.js'

interface I18nValidationResult {
  totalFilesAnalyzed: number
  lintedResults: LocaleFileAnalysisResult[]
  skippedResults: LocaleFileAnalysisResult[]
  totalConflictCount: number
  totalInvalidValueCount: number
  totalFilesWithErrors: number
}

export async function validate(path: string): Promise<I18nValidationResult> {
  console.info(`Linting i18n files in: ${path}`)

  const jsonFiles = await findJsonFilesRecursively(path)
  console.info(`Found ${jsonFiles.length} JSON file(s)`)

  if (jsonFiles.length === 0) {
    throw new Error(`No JSON files found in: ${path}`)
  }

  const analysisResults = await Promise.all(jsonFiles.map(file => analyzeLocaleFile(file)))

  const skippedResults = analysisResults.filter(result => result.error)
  const lintedResults = analysisResults.filter(result => !result.error)

  let totalConflictCount = 0
  let totalInvalidValueCount = 0
  let totalFilesWithErrors = 0

  for (const result of lintedResults) {
    const errorCount = result.invalidValues.length + result.conflicts.length

    if (errorCount > 0) {
      totalFilesWithErrors++
    }

    totalConflictCount += result.conflicts.length
    totalInvalidValueCount += result.invalidValues.length
  }

  return {
    totalFilesAnalyzed: jsonFiles.length,
    lintedResults,
    skippedResults,
    totalConflictCount,
    totalInvalidValueCount,
    totalFilesWithErrors,
  }
}
