import { describe, expect, it } from 'vitest'
import { isDateValid } from '../../src/rules/date'

import { VALID_NAMES } from '../stubs'

describe('test date rule', () => {
  it.each(VALID_NAMES)('name "%s" is valid', (name) => {
    const isValid = isDateValid(name)
    expect(isValid).toBe(true)
  })
})
