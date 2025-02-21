import fs from 'node:fs'

const FOLDER_NAME_PATTERN = new RegExp(/\b(20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{6}_(.*)\b/gm)

function doesFolderNameMatchFormat(name: string) {
    return FOLDER_NAME_PATTERN.test(name)
}

export async function validateMigrations(path: string) {
  console.log(`Validating migrations at ${path}`)
  
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
        console.log(`❌ Migration ${dirent.name} is invalid`)
        failedFiles.push(dirent.name)
      } else {
        console.log(`✅ Migration ${dirent.name} is valid`)
      }
    }
    
    console.log('Verification finished.')
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
