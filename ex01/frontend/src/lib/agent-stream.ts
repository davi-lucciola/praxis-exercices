import type { AgentExecuteIn, AgentStreamEvent } from '@/lib/agent-types'

export async function streamAgentExecute(options: {
  threadId: string
  input: AgentExecuteIn
  signal?: AbortSignal
  onEvent: (event: AgentStreamEvent) => void
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

  await readSse(response.body, options.onEvent)
}

async function readSse(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: AgentStreamEvent) => void,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = 'message'

  const flushBlock = (block: string) => {
    if (!block.trim()) {
      eventName = 'message'
      return
    }

    let dataLine: string | null = null
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) {
        eventName = line.slice('event:'.length).trim()
      } else if (line.startsWith('data:')) {
        dataLine = line.slice('data:'.length).trim()
      }
    }

    if (dataLine) {
      const payload = JSON.parse(dataLine) as AgentStreamEvent
      onEvent({ ...payload, event: eventName || payload.event })
    }

    eventName = 'message'
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })

    let separator = buffer.indexOf('\n\n')
    while (separator !== -1) {
      flushBlock(buffer.slice(0, separator))
      buffer = buffer.slice(separator + 2)
      separator = buffer.indexOf('\n\n')
    }

    if (done) {
      flushBlock(buffer)
      break
    }
  }
}
