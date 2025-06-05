import fs from 'node:fs'
import { joinURL } from 'ufo'
import { isDateValid } from './rules/date'
import { isFormatValid } from './rules/format'
import { hasPRLink } from './rules/link'
import { hasTransactionWrapper } from './rules/transaction'

export type Rule = 'format' | 'date' | 'missing' | 'link' | 'transaction'

interface ValidateOptions {
  ignore: string[]
  rules: string[]
}

export async function validate(path: string, options: ValidateOptions) {
  console.log(`Validating migrations at ${path}`)
  console.log('---------------------------------------------------------')

  const opendir = fs.promises.opendir
  const existsSync = fs.existsSync
  const readFile = fs.promises.readFile

  const failedFiles: { name: string, reason: Rule }[] = []
  let totalFilesAnalyzed = 0

  try {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      // Do not check file names
      if (!dirent.isDirectory()) {
        continue
      }

      // Check if migration is in ignore folder
      if (options.ignore.includes(dirent.name)) {
        console.log(`🟠 Migration ${dirent.name} is ignored`)
        continue
      }

      totalFilesAnalyzed++

      // Test 1: Does the name match the pattern?
      if (!isFormatValid(dirent.name) && options.rules.includes('format')) {
        console.log(`❌ Migration ${dirent.name} is invalid format`)
        failedFiles.push({ name: dirent.name, reason: 'format' })
        continue
      }

      // Test 2: Is the date in the folder name in the past?
      if (!isDateValid(dirent.name) && options.rules.includes('date')) {
        console.log(`❌ Migration ${dirent.name} is invalid date`)
        failedFiles.push({ name: dirent.name, reason: 'date' })
        continue
      }

      // Test 3: Does the migration folder contain a migration.sql file?
      const filePath = joinURL(dirent.parentPath, dirent.name, 'migration.sql')
      if (!existsSync(filePath) && options.rules.includes('missing')) {
        console.log(`❌ Migration ${dirent.name} does not contain a migration.sql file`)
        failedFiles.push({ name: dirent.name, reason: 'missing' })
        continue
      }

      const migration = await readFile(filePath, 'utf8')

      // Test 4: Does the migration file have a PR linked at the top?
      if (!hasPRLink(migration) && options.rules.includes('link')) {
        console.log(`❌ Migration ${dirent.name} does not have a PR linked at the top of the migration`)
        failedFiles.push({ name: dirent.name, reason: 'link' })
        continue
      }

      // Test 5: Is the migration wrapped in a transaction block?
      if (!hasTransactionWrapper(migration) && options.rules.includes('transaction')) {
        console.log(`❌ Migration ${dirent.name} is not wrapped in a transaction block`)
        failedFiles.push({ name: dirent.name, reason: 'transaction' })
        continue
      }

      console.log(`✅ Migration "${dirent.name}" is valid`)
    }

    console.log('---------------------------------------------------------')
    console.log(`ℹ️ Migrations analyzed: \t${totalFilesAnalyzed}`)
    console.log('---------------------------------------------------------')
  } catch {
    throw new Error('❌ Execution failed, see log above.')
  }

  if (failedFiles.length) {
    for (const issue of failedFiles) {
      console.log(`❌ Migration "${issue.name}" failed due to "${issue.reason}"`)
    }
    throw new Error(`${failedFiles.length} files not matching the pattern were found, see log above.`)
  }

  console.log('✅ Success: All migrations are correctly named!')
  return {
    totalFilesAnalyzed,
    failedFiles,
  }
}
