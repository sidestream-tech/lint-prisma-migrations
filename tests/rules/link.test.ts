import { describe, expect, it } from 'vitest'
import { hasPRLink } from '../../src/rules/link'

import { CORRECT_MIGRATION, INCORRECT_MIGRATION_PR_LINK } from '../stubs'

describe('test pr-link rule', () => {
  it('migration has a pr link', () => {
    const isValid = hasPRLink(CORRECT_MIGRATION)
    expect(isValid).toBe(true)
  })

  it('migration does not have a pr link', () => {
    const isValid = hasPRLink(INCORRECT_MIGRATION_PR_LINK)
    expect(isValid).toBe(false)
  })
})
