import { describe, expect, it } from 'vitest'
import { contactFormSchema } from './schema'

describe('contactFormSchema', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello there, I am hiring.' }

  it('accepts a well-formed message', () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a missing/invalid email', () => {
    expect(contactFormSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a too-short message', () => {
    expect(contactFormSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
  })

  it('rejects a too-short name', () => {
    expect(contactFormSchema.safeParse({ ...valid, name: 'J' }).success).toBe(false)
  })

  it('accepts a submission with an empty honeypot field', () => {
    expect(contactFormSchema.safeParse({ ...valid, company: '' }).success).toBe(true)
  })

  it('rejects a submission where the honeypot field was filled in', () => {
    expect(contactFormSchema.safeParse({ ...valid, company: 'Acme Corp' }).success).toBe(false)
  })
})
