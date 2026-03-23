import * as core from '@actions/core'
import * as github from '@actions/github'

import { validate as validateI18n } from './i18n/validate.js'
import { validate as validatePrismaMigrations } from './prisma-migrations/validate.js'

async function run(): Promise<void> {
  try {
    const prismaMigrationsPath = core.getInput('prisma-migrations-path', { required: false })
    const i18nPath = core.getInput('i18n-path', { required: false })

    if (!prismaMigrationsPath && !i18nPath) {
      core.setFailed('At least one of "prisma-migrations-path" or "i18n-path" must be provided')
      return
    }

    const errors: string[] = []

    if (prismaMigrationsPath) {
      const ignore = core.getMultilineInput('prisma-migrations-ignore', { required: false })
      const rules = core.getMultilineInput('prisma-migrations-rules', { required: false })

      try {
        const output = await validatePrismaMigrations(prismaMigrationsPath, { ignore, rules })
        core.setOutput('prisma-migrations-files-analyzed', output.totalFilesAnalyzed)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`Prisma migrations: ${message}`)
      }
    }

    if (i18nPath) {
      try {
        const output = await validateI18n(i18nPath)
        core.setOutput('i18n-files-analyzed', output.totalFilesAnalyzed)

        for (const result of output.lintedResults) {
          const errorCount = result.invalidValues.length + result.conflicts.length

          if (errorCount > 0) {
            core.info(result.filePath)

            for (const invalidValue of result.invalidValues) {
              const linePrefix = invalidValue.line !== undefined ? `Line ${invalidValue.line}: ` : ''
              const message = `${linePrefix}Key "${invalidValue.key}" has invalid value type "${invalidValue.actualType}" (expected "string")`
              core.error(message, { file: result.filePath, startLine: invalidValue.line })
            }

            for (const conflict of result.conflicts) {
              const linePrefix = conflict.leafKeyLine !== undefined ? `Line ${conflict.leafKeyLine}: ` : ''
              const message = `${linePrefix}Key "${conflict.leafKey}" conflicts with "${conflict.conflictingDescendantKey}" — a key cannot be both a value and a namespace prefix`
              core.error(message, { file: result.filePath, startLine: conflict.leafKeyLine })
            }
          }
        }

        if (output.skippedResults.length > 0) {
          core.startGroup(`Skipped files (${output.skippedResults.length})`)
          for (const skipped of output.skippedResults) {
            core.warning(`Skipping ${skipped.filePath}: ${skipped.error}`)
          }
          core.endGroup()
        }

        const totalErrorCount = output.totalConflictCount + output.totalInvalidValueCount
        if (totalErrorCount > 0) {
          const parts: string[] = []

          if (output.totalConflictCount > 0) {
            parts.push(`${output.totalConflictCount} namespace conflict(s)`)
          }

          if (output.totalInvalidValueCount > 0) {
            parts.push(`${output.totalInvalidValueCount} invalid value(s)`)
          }

          const skippedSuffix = output.skippedResults.length > 0 ? ` (${output.skippedResults.length} skipped)` : ''
          errors.push(`i18n: Found ${parts.join(' and ')} across ${output.totalFilesWithErrors} file(s)${skippedSuffix}`)
        } else {
          const skippedSuffix = output.skippedResults.length > 0 ? ` (${output.skippedResults.length} skipped)` : ''
          core.info(`i18n: All ${output.lintedResults.length} file(s) linted successfully${skippedSuffix}`)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`i18n: ${message}`)
      }
    }

    if (errors.length > 0) {
      core.setFailed(errors.join('\n'))
      return
    }

    const payload = JSON.stringify(github.context.payload, undefined, 2)
    core.debug(`The event payload: ${payload}`)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      core.setFailed('An unknown error occurred. Check the logs for details')
    }
  }
}

run()
