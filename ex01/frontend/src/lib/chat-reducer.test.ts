import { describe, expect, it } from 'vitest'

import { chatReducer } from '@/lib/chat-reducer'

describe('chatReducer', () => {
  it('concatenates assistant tokens for the same run', () => {
    const withUser = chatReducer([], {
      type: 'addUser',
      id: 'u1',
      content: 'tempo em Recife',
    })

    const first = chatReducer(withUser, {
      type: 'applyEvent',
      event: {
        event: 'on_chat_model_stream',
        run_id: 'run-1',
        data: { chunk: { content: 'Nub' } },
      },
    })
    const second = chatReducer(first, {
      type: 'applyEvent',
      event: {
        event: 'on_chat_model_stream',
        run_id: 'run-1',
        data: { chunk: { content: 'lado' } },
      },
    })

    expect(second).toEqual([
      { kind: 'user', id: 'u1', content: 'tempo em Recife' },
      { kind: 'assistant', id: 'run-1', content: 'Nublado' },
    ])
  })

  it('ignores tool-call chunks without text', () => {
    const items = chatReducer([], {
      type: 'applyEvent',
      event: {
        event: 'on_chat_model_stream',
        run_id: 'run-1',
        data: { chunk: { content: [{ type: 'tool_call_chunk', name: 'get_weather' }] } },
      },
    })

    expect(items).toEqual([])
  })

  it('turns get_weather into a card that goes from running to done', () => {
    const running = chatReducer([], {
      type: 'applyEvent',
      event: {
        event: 'on_tool_start',
        name: 'get_weather',
        run_id: 'tool-1',
        data: { input: { city: 'Recife' } },
      },
    })

    expect(running).toEqual([{ kind: 'weather', id: 'tool-1', city: 'Recife', status: 'running' }])

    const done = chatReducer(running, {
      type: 'applyEvent',
      event: {
        event: 'on_tool_end',
        name: 'get_weather',
        run_id: 'tool-1',
        data: {
          input: { city: 'Recife' },
          output: { temperature: 26 },
        },
      },
    })

    expect(done).toEqual([
      {
        kind: 'weather',
        id: 'tool-1',
        city: 'Recife',
        status: 'done',
        temperature: 26,
      },
    ])
  })

  it('reads temperature from a LangChain ToolMessage on_tool_end payload', () => {
    const running = chatReducer([], {
      type: 'applyEvent',
      event: {
        event: 'on_tool_start',
        name: 'get_weather',
        run_id: 'tool-1',
        data: { input: { city: 'Recife' } },
      },
    })

    const done = chatReducer(running, {
      type: 'applyEvent',
      event: {
        event: 'on_tool_end',
        name: 'get_weather',
        run_id: 'tool-1',
        data: {
          input: { city: 'Recife' },
          output: { content: 'temperature=26.0', type: 'tool', name: 'get_weather' },
        },
      },
    })

    expect(done).toEqual([
      {
        kind: 'weather',
        id: 'tool-1',
        city: 'Recife',
        status: 'done',
        temperature: 26,
      },
    ])
  })
})
