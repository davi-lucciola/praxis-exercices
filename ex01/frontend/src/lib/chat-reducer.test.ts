import { describe, expect, it } from 'vitest'

import { chatReducer } from '@/lib/chat-reducer'

describe('chatReducer', () => {
  it('stores user and assistant turns and appends events', () => {
    const withUser = chatReducer([], {
      type: 'addUser',
      id: 'u1',
      content: 'tempo em Recife',
    })
    const withAssistant = chatReducer(withUser, { type: 'startAssistant', id: 'a1' })
    const withEvent = chatReducer(withAssistant, {
      type: 'applyEvent',
      event: {
        type: 'on_chat_model_stream',
        data: { run_id: 'run-1', data: { chunk: { content: 'Nublado' } } },
      },
    })

    expect(withEvent).toEqual([
      { role: 'user', id: 'u1', content: 'tempo em Recife' },
      {
        role: 'assistant',
        id: 'a1',
        events: [
          {
            type: 'on_chat_model_stream',
            data: { run_id: 'run-1', data: { chunk: { content: 'Nublado' } } },
            at: expect.any(Number),
          },
        ],
      },
    ])
  })

  it('resets the transcript', () => {
    const turns = chatReducer([{ role: 'user', id: 'u1', content: 'oi' }], { type: 'reset' })
    expect(turns).toEqual([])
  })
})
