import { describe, expect, it } from 'vitest'

import { parseEvent } from '@/lib/agent-stream'
import { UnknownEventError } from '@/lib/agent-types'

describe('parseEvent', () => {
  it('accepts an allowlisted stream type', () => {
    const event = parseEvent('on_chat_model_stream', {
      event: 'on_chat_model_stream',
      run_id: 'run-1',
      data: { chunk: { content: 'hi' } },
    })

    expect(event.type).toBe('on_chat_model_stream')
    expect(event.data.run_id).toBe('run-1')
  })

  it('throws on an unknown stream type', () => {
    expect(() => parseEvent('on_chain_start', {})).toThrow(UnknownEventError)
  })
})
