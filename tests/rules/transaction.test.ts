import { describe, expect, it } from 'vitest'
import { hasTransactionWrapper } from '../../src/rules/transaction'

import { CORRECT_MIGRATION, INCORRECT_MIGRATION_TRANSACTION_BLOCK } from '../stubs'

describe('test transaction rule', () => {
  it('migration is wrapped in a transaction block', () => {
    const isValid = hasTransactionWrapper(CORRECT_MIGRATION)
    expect(isValid).toBe(true)
  })

  it('migration is not wrapped in a transaction block', () => {
    const isValid = hasTransactionWrapper(INCORRECT_MIGRATION_TRANSACTION_BLOCK)
    expect(isValid).toBe(false)
  })
})
