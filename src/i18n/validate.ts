import type { LocaleFileAnalysisResult } from './types.js'

import { analyzeLocaleFile } from './conflict-detection.js'
import { findJsonFilesRecursively } from './file-discovery.js'

interface I18nValidationResult {
  totalFilesAnalyzed: number
  lintedResults: LocaleFileAnalysisResult[]
  filesWithErrors: LocaleFileAnalysisResult[]
  skippedResults: LocaleFileAnalysisResult[]
  totalConflictCount: number
  totalInvalidValueCount: number
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

  const filesWithErrors: LocaleFileAnalysisResult[] = []
  let totalConflictCount = 0
  let totalInvalidValueCount = 0

  for (const result of lintedResults) {
    totalConflictCount += result.conflicts.length
    totalInvalidValueCount += result.invalidValues.length

    if (result.invalidValues.length > 0 || result.conflicts.length > 0) {
      filesWithErrors.push(result)
    }
  }

  return {
    totalFilesAnalyzed: jsonFiles.length,
    lintedResults,
    filesWithErrors,
    skippedResults,
    totalConflictCount,
    totalInvalidValueCount,
  }
}
