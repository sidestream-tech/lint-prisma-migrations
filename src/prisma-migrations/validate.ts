import fs from 'node:fs'
import { join } from 'node:path'
import { isDateValid } from './rules/date.js'
import { isFormatValid } from './rules/format.js'
import { hasPRLink } from './rules/link.js'
import { hasTransactionWrapper } from './rules/transaction.js'

type Rule = 'format' | 'date' | 'missing' | 'link' | 'transaction'
const DEFAULT_RULES: Rule[] = ['date', 'format', 'missing', 'link', 'transaction']

interface ValidateOptions {
  ignore: string[]
  rules: string[]
}

export async function validate(path: string, options: ValidateOptions) {
  const rules = options.rules.length > 0 ? options.rules : DEFAULT_RULES

  console.info(`Validating migrations at ${path} with rules: ${rules.join(', ')}`)
  console.info('---------------------------------------------------------')

  const opendir = fs.promises.opendir
  const existsSync = fs.existsSync
  const readFile = fs.promises.readFile

  const failedFiles: { name: string, reason: Rule }[] = []
  let totalFilesAnalyzed = 0

  try {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      if (!dirent.isDirectory()) {
        continue
      }

      if (options.ignore.includes(dirent.name)) {
        console.info(`🟠 Migration ${dirent.name} is ignored`)
        continue
      }

      totalFilesAnalyzed++

      if (!isFormatValid(dirent.name) && rules.includes('format')) {
        console.info(`❌ Migration ${dirent.name} is invalid format`)
        failedFiles.push({ name: dirent.name, reason: 'format' })
        continue
      }

      if (!isDateValid(dirent.name) && rules.includes('date')) {
        console.info(`❌ Migration ${dirent.name} is invalid date`)
        failedFiles.push({ name: dirent.name, reason: 'date' })
        continue
      }

      const filePath = join(dirent.parentPath, dirent.name, 'migration.sql')
      if (!existsSync(filePath) && rules.includes('missing')) {
        console.info(`❌ Migration ${dirent.name} does not contain a migration.sql file`)
        failedFiles.push({ name: dirent.name, reason: 'missing' })
        continue
      }

      const migration = await readFile(filePath, 'utf8')

      if (!hasPRLink(migration) && rules.includes('link')) {
        console.info(`❌ Migration ${dirent.name} does not have a PR linked at the top of the migration`)
        failedFiles.push({ name: dirent.name, reason: 'link' })
        continue
      }

      if (!hasTransactionWrapper(migration) && rules.includes('transaction')) {
        console.info(`❌ Migration ${dirent.name} is not wrapped in a transaction block`)
        failedFiles.push({ name: dirent.name, reason: 'transaction' })
        continue
      }

      console.info(`✅ Migration "${dirent.name}" is valid`)
    }

    console.info('---------------------------------------------------------')
    console.info(`ℹ️ Migrations analyzed: \t${totalFilesAnalyzed}`)
    console.info('---------------------------------------------------------')
  } catch {
    throw new Error('❌ Execution failed, see log above.')
  }

  if (failedFiles.length) {
    for (const issue of failedFiles) {
      console.info(`❌ Migration "${issue.name}" failed due to "${issue.reason}"`)
    }
    throw new Error(`${failedFiles.length} files not matching the pattern were found, see log above.`)
  }

  console.info('✅ Success: All migrations are correctly named!')
  return {
    totalFilesAnalyzed,
    failedFiles,
  }
}
