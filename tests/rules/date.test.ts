import { describe, expect, it } from 'vitest'
import { isDateValid } from '../../src/rules/date'

import { VALID_MIGRATION_NAMES } from '../stubs'

describe('test date rule', () => {
  it.each(VALID_MIGRATION_NAMES)('name "%s" is valid', (name) => {
    const isValid = isDateValid(name)
    expect(isValid).toBe(true)
  })
})
