import * as core from '@actions/core'
import * as github from '@actions/github'

import { validate } from './validate'

const DEFAULT_PATH = './prisma/migrations/'

async function run(): Promise<void> {
  try {
    const path = core.getInput('path', { required: false }) || DEFAULT_PATH
    const ignore = core.getMultilineInput('ignore', { required: false })
    const rules = core.getMultilineInput('rules', { required: false })

    const output = await validate(path, { ignore, rules })

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
