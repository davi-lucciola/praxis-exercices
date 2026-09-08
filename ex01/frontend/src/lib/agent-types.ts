export type LangChainMessageType = 'human' | 'ai' | 'tool' | 'system'
export type LangChainMessageRole = 'user' | 'assistant' | 'tool' | 'system'

export type LangChainMessage = {
  content: string | unknown[]
  type?: LangChainMessageType
  role?: LangChainMessageRole
  [key: string]: unknown
}

export type AgentExecuteIn = {
  messages: LangChainMessage | LangChainMessage[]
}

export type AgentStreamEvent = {
  event: string
  name?: string
  run_id?: string
  data?: {
    chunk?: { content?: unknown }
    input?: { city?: unknown } & Record<string, unknown>
    output?: unknown
    error?: unknown
  }
}

export function normalizeSubmitMessages(
  messages: LangChainMessage | LangChainMessage[],
): LangChainMessage[] {
  return Array.isArray(messages) ? messages : [messages]
}

export function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content
  }

  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .map((block) => {
      if (typeof block === 'string') {
        return block
      }
      if (block && typeof block === 'object' && 'text' in block && typeof block.text === 'string') {
        return block.text
      }
      return ''
    })
    .join('')
}

export function readCity(input: unknown): string {
  if (input && typeof input === 'object' && 'city' in input) {
    const city = (input as { city: unknown }).city
    if (typeof city === 'string') {
      return city
    }
  }
  return ''
}

const PYDANTIC_TEMPERATURE = /temperature\s*=\s*(-?\d+(?:\.\d+)?)/i

export function readTemperature(output: unknown): number | undefined {
  if (typeof output === 'number') {
    return Number.isFinite(output) ? output : undefined
  }

  if (typeof output === 'string') {
    try {
      return readTemperature(JSON.parse(output))
    } catch {
      const parsed = Number(output)
      if (Number.isFinite(parsed)) {
        return parsed
      }

      const match = output.match(PYDANTIC_TEMPERATURE)
      return match ? Number(match[1]) : undefined
    }
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      const temperature = readTemperature(item)
      if (temperature !== undefined) {
        return temperature
      }
    }
    return undefined
  }

  if (output && typeof output === 'object') {
    if ('temperature' in output) {
      return readTemperature((output as { temperature: unknown }).temperature)
    }
    if ('content' in output) {
      return readTemperature((output as { content: unknown }).content)
    }
    if ('output' in output) {
      return readTemperature((output as { output: unknown }).output)
    }
  }

  return undefined
}
