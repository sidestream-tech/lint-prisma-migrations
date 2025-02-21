import fs from 'node:fs'

const FOLDER_NAME_PATTERN = new RegExp(/\b(20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{6}_(.*)\b/gm)

function doesFolderNameMatchFormat(name: string) {
    return FOLDER_NAME_PATTERN.test(name)
}

function isFolderDateInPast(name: string) {
  const year = parseFloat(name.slice(0, 4))
  const month = parseFloat(name.slice(5, 6))
  const day = parseFloat(name.slice(7, 8))

  const date = new Date(year, month, day)

  return Date.now() > date.getTime()
}

export async function validateMigrations(path: string) {
  console.log(`Validating migrations at ${path}`)
  console.log('-------------------')

  const opendir = fs.promises.opendir

  const failedFiles: string[] = []
  let totalFilesAnalyzed = 0

  try {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      // Do not check file names
      if (!dirent.isDirectory()) {
        continue
      }

      totalFilesAnalyzed++

      // Test 1: Does the name match the pattern?
      if (!doesFolderNameMatchFormat(dirent.name)) {
        console.log(`❌ Migration ${dirent.name} is invalid format`)
        failedFiles.push(dirent.name)
      } else {
        // Test 2: Is the date in the folder name in the past?
        if (!isFolderDateInPast(dirent.name)) {
          console.log(`❌ Migration ${dirent.name} is invalid date`)
          failedFiles.push(dirent.name)
        } else {
          console.log(`✅ Migration ${dirent.name} is valid`)
        }
      }
    }
    
    console.log('-------------------')
    console.log(`ℹ️ Migrations analyzed: \t${totalFilesAnalyzed}`)
  } catch (error) {
    throw new Error('Execution failed, see log above.')
  }

  if (failedFiles.length) {
    throw new Error(`${failedFiles.length} files not matching the pattern were found, see log above.`)
  } else {
    console.log('✅ Success: All migrations are correctly named!')
    return {
      totalFilesAnalyzed,
      failedFiles,
    }
  }
}
