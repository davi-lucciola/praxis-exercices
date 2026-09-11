import { describe, expect, it } from 'vitest'

import { messageText } from '@/lib/agent-types'

describe('messageText', () => {
  it('reads flattened content', () => {
    expect(messageText({ content: 'Nublado' })).toBe('Nublado')
  })

  it('reads LangChain dumps kwargs.content', () => {
    expect(messageText({ kwargs: { content: 'Nublado' } })).toBe('Nublado')
  })

  it('reads a JSON string as-is', () => {
    expect(messageText('{"temperature":26}')).toBe('{"temperature":26}')
  })
})
