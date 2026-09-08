import { describe, expect, it } from 'vitest'
import type { AgentEvent } from '@/lib/agent-types'
import { foldEvents, isThinking } from '@/lib/blocks'

function event(partial: AgentEvent): AgentEvent {
  return partial
}

describe('foldEvents', () => {
  it('concatenates assistant tokens for the same model pass', () => {
    const blocks = foldEvents([
      event({
        type: 'on_chat_model_start',
        data: { run_id: 'run-1', data: {} },
      }),
      event({
        type: 'on_chat_model_stream',
        data: { run_id: 'run-1', data: { chunk: { content: 'Nub' } } },
      }),
      event({
        type: 'on_chat_model_stream',
        data: { run_id: 'run-1', data: { chunk: { content: 'lado' } } },
      }),
      event({
        type: 'on_chat_model_end',
        data: { run_id: 'run-1', data: { output: { content: 'Nublado' } } },
      }),
    ])

    expect(blocks).toEqual([{ kind: 'text', id: 'run-1', text: 'Nublado', streaming: false }])
  })

  it('drops the text block of a tool-call model pass', () => {
    const blocks = foldEvents([
      event({
        type: 'on_chat_model_start',
        data: { run_id: 'run-1', data: {} },
      }),
      event({
        type: 'on_chat_model_end',
        data: {
          run_id: 'run-1',
          data: {
            output: {
              kwargs: {
                content: '',
                tool_calls: [{ name: 'get_weather', args: { city: 'Recife' } }],
              },
            },
          },
        },
      }),
    ])

    expect(blocks).toEqual([])
  })

  it('turns get_weather into a card that goes from running to done', () => {
    const running = foldEvents([
      event({
        type: 'on_tool_start',
        data: {
          run_id: 'tool-1',
          name: 'get_weather',
          data: { input: { city: 'Recife' } },
        },
      }),
    ])

    expect(running).toEqual([
      {
        kind: 'tool',
        id: 'tool-1',
        name: 'get_weather',
        input: { city: 'Recife' },
        status: 'running',
        startedAt: undefined,
      },
    ])

    const done = foldEvents([
      event({
        type: 'on_tool_start',
        data: {
          run_id: 'tool-1',
          name: 'get_weather',
          data: { input: { city: 'Recife' } },
        },
      }),
      event({
        type: 'on_tool_end',
        data: {
          run_id: 'tool-1',
          name: 'get_weather',
          data: {
            input: { city: 'Recife' },
            output: '{"city":"Recife","temperature":26,"condition":"nublado"}',
          },
        },
      }),
    ])

    expect(done).toEqual([
      {
        kind: 'tool',
        id: 'tool-1',
        name: 'get_weather',
        input: { city: 'Recife' },
        output: '{"city":"Recife","temperature":26,"condition":"nublado"}',
        status: 'done',
        startedAt: undefined,
        endedAt: undefined,
      },
    ])
  })

  it('marks a failed tool as error', () => {
    const blocks = foldEvents([
      event({
        type: 'on_tool_start',
        data: { run_id: 'tool-1', name: 'get_weather', data: { input: { city: 'Recife' } } },
      }),
      event({
        type: 'on_tool_error',
        data: { run_id: 'tool-1', name: 'get_weather', data: { error: 'boom' } },
      }),
    ])

    expect(blocks[0]).toMatchObject({ kind: 'tool', status: 'error' })
  })
})

describe('isThinking', () => {
  it('is true before anything is visible', () => {
    expect(isThinking([])).toBe(true)
  })
})
