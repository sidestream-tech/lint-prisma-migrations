import { describe, expect, it } from 'vitest'
import { isFormatValid } from '../../src/rules/format'

import { VALID_MIGRATION_NAMES } from '../stubs'

describe('test format rule', () => {
  it.each(VALID_MIGRATION_NAMES)('name "%s" is valid', (name) => {
    const isValid = isFormatValid(name)
    expect(isValid).toBe(true)
  })
})
