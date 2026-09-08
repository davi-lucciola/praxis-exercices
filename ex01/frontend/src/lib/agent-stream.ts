import {
  type AgentEvent,
  type AgentExecuteIn,
  isEventType,
  UnknownEventError,
} from '@/lib/agent-types'

export function parseEvent(type: string, data: unknown): AgentEvent {
  if (isEventType(type)) {
    return { type, data: (data ?? {}) as AgentEvent['data'] }
  }
  throw new UnknownEventError(type)
}

export async function streamAgentExecute(options: {
  threadId: string
  input: AgentExecuteIn
  signal?: AbortSignal
  onEvent: (event: AgentEvent) => void
}): Promise<void> {
  const response = await fetch(
    `/agent/execute/stream?thread_id=${encodeURIComponent(options.threadId)}`,
    {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options.input),
      signal: options.signal,
    },
  )

  if (!response.ok) {
    throw new Error('Não foi possível falar com o assistente.')
  }

  if (!response.body) {
    throw new Error('O assistente não devolveu um fluxo de resposta.')
  }

  for await (const event of readSse(response.body)) {
    options.onEvent(event)
  }
}

export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<AgentEvent> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''

    for (const frame of frames) {
      const parsed = parseFrame(frame)
      if (parsed) {
        yield parsed
      }
    }

    if (done) {
      const parsed = parseFrame(buffer)
      if (parsed) {
        yield parsed
      }
      break
    }
  }
}

function parseFrame(frame: string): AgentEvent | null {
  let type = ''
  const dataLines: string[] = []

  for (const line of frame.split('\n')) {
    if (line.startsWith('event:')) {
      type = line.slice('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice('data:'.length).trimStart())
    }
  }

  if (!type || dataLines.length === 0) {
    return null
  }

  return parseEvent(type, JSON.parse(dataLines.join('\n')))
}
