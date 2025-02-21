import fs from 'node:fs'

// eslint-disable-next-line regexp/no-unused-capturing-group, prefer-regex-literals
const FOLDER_NAME_PATTERN = new RegExp(/\b(20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{6}_(.*)\b/)

function isFolderDateInPast(name: string) {
  const year = Number.parseFloat(name.slice(0, 4))
  const month = Number.parseFloat(name.slice(5, 6))
  const day = Number.parseFloat(name.slice(7, 8))

  const date = new Date(year, month, day)

  return Date.now() > date.getTime()
}

export async function validateMigrations(path: string, ignore: string[]) {
  console.log(`Validating migrations at ${path}`)
  console.log('---------------------------------------------------------')

  const opendir = fs.promises.opendir

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
      if (!FOLDER_NAME_PATTERN.test(dirent.name)) {
        console.log(`❌ Migration ${dirent.name} is invalid format`)
        failedFiles.push({ name: dirent.name, reason: 'format' })
        continue
      }

      // Test 2: Is the date in the folder name in the past?
      if (!isFolderDateInPast(dirent.name)) {
        console.log(`❌ Migration ${dirent.name} is invalid date`)
        failedFiles.push({ name: dirent.name, reason: 'date' })
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
