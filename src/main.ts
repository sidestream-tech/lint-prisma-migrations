import * as core from '@actions/core'
import * as github from '@actions/github'

import { validateFilenames } from './validate-filenames'

const DEFAULT_PATH = './prisma/migrations/'

async function run(): Promise<void> {
  try {
    console.log('====================')
    console.log('|  Lint Filenames  |')
    console.log('====================')

    const path = core.getInput('path', { required: true }) || DEFAULT_PATH
    const pattern = new RegExp(/\b(20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{6}_(.*)\b/gm)

    const output = await validateFilenames(path, pattern)

    core.setOutput('total-files-analyzed', output.totalFilesAnalyzed)

    // Get the JSON webhook payload for the event that triggered the workflow
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
