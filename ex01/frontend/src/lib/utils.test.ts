import { afterEach, describe, expect, it, vi } from 'vitest'

import { cn, createId, polyfillRandomUUID } from '@/lib/utils'

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('createId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses crypto.randomUUID when available', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => '11111111-1111-4111-8111-111111111111',
      getRandomValues: crypto.getRandomValues.bind(crypto),
    })

    expect(createId()).toBe('11111111-1111-4111-8111-111111111111')
  })

  it('falls back when crypto.randomUUID is missing', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: crypto.getRandomValues.bind(crypto),
    })

    expect(createId()).toMatch(UUID_V4)
  })
})

describe('polyfillRandomUUID', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defines crypto.randomUUID when missing', () => {
    const getRandomValues = crypto.getRandomValues.bind(crypto)
    vi.stubGlobal('crypto', { getRandomValues })

    polyfillRandomUUID()

    expect(typeof crypto.randomUUID).toBe('function')
    expect(crypto.randomUUID()).toMatch(UUID_V4)
  })
})
