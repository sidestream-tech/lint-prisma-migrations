import fs from 'node:fs'
import { isDateValid } from './rules/date'
import { isFormatValid } from './rules/format'

export async function validate(path: string, ignore: string[]) {
  console.log(`Validating migrations at ${path}`)
  console.log('---------------------------------------------------------')

  const opendir = fs.promises.opendir
  const readFile = fs.promises.readFile

  const failedFiles: { name: string, reason: 'format' | 'date' }[] = []
  let totalFilesAnalyzed = 0

  try {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      // Do not check file names
      if (!dirent.isDirectory()) {
        continue
      }

      // Check if migration is in ignore folder
      if (ignore.includes(dirent.name)) {
        console.log(`🟠 Migration ${dirent.name} is ignored`)
        continue
      }

      totalFilesAnalyzed++

      // Test 1: Does the name match the pattern?
      if (!isFormatValid(dirent.name)) {
        console.log(`❌ Migration ${dirent.name} is invalid format`)
        failedFiles.push({ name: dirent.name, reason: 'format' })
        continue
      }

      // Test 2: Is the date in the folder name in the past?
      if (!isDateValid(dirent.name)) {
        console.log(`❌ Migration ${dirent.name} is invalid date`)
        failedFiles.push({ name: dirent.name, reason: 'date' })
        continue
      }

      console.log(dirent.parentPath)
      const fileContents = await readFile(dirent.parentPath)

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
