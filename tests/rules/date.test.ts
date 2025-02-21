import { describe, expect, it } from 'vitest'
import { isDateValid } from '../../src/rules/date'

import { VALID_NAMES } from '../stubs'

const FUTURE_NAME_DATE = `${new Date().getFullYear() + 1}0101000000_future_date`

describe('test date rule', () => {
  it.each(VALID_NAMES)('name "%s" is valid', (name) => {
    const isValid = isDateValid(name)
    expect(isValid).toBe(true)
  })

  it(`name ${FUTURE_NAME_DATE} is invalid`, () => {
    const isValid = isDateValid(FUTURE_NAME_DATE)
    expect(isValid).toBe(false)
  })
})
