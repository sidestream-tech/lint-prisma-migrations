import { describe, expect, it } from 'vitest'
import { isFormatValid } from '../../src/rules/format'

import { VALID_NAMES, INVALID_NAMES_FORMAT } from '../stubs'

describe('test format rule', () => {
  it.each(VALID_NAMES)('name "%s" is valid', (name) => {
    const isValid = isFormatValid(name)
    expect(isValid).toBe(true)
  })

  it.each(INVALID_NAMES_FORMAT)('name "%s" is invalid', (name) => {
    const isValid = isFormatValid(name)
    expect(isValid).toBe(false)
  })
})
