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

export const EVENTS = [
  'on_chat_model_start',
  'on_chat_model_stream',
  'on_chat_model_end',
  'on_tool_start',
  'on_tool_end',
  'on_tool_error',
] as const

export type EventType = (typeof EVENTS)[number]

export type ToolCall = {
  name: string
  args: Record<string, unknown>
  id?: string
}

/** LangChain `dumps` constructor payload (and flattened cousins). */
export type LcMessage = {
  lc?: number
  type?: string
  id?: string[]
  content?: unknown
  kwargs?: {
    content?: unknown
    type?: string
    name?: string
    tool_calls?: ToolCall[]
  }
}

export type StreamEventData = {
  chunk?: LcMessage
  input?: unknown
  output?: unknown
  error?: unknown
  [key: string]: unknown
}

/** Runnable StreamEvent. SSE `data` is this object, complete. */
export type StreamEvent = {
  event?: string
  name?: string
  run_id?: string
  data?: StreamEventData
  [key: string]: unknown
}

/** `at` is stamped by the client when the frame lands (for elapsed time). */
export type AgentEvent = { type: EventType; data: StreamEvent; at?: number }

export class UnknownEventError extends Error {
  constructor(type: string) {
    super(`unknown event type: ${type}`)
    this.name = 'UnknownEventError'
  }
}

export function isEventType(type: string): type is EventType {
  return (EVENTS as readonly string[]).includes(type)
}

export function normalizeSubmitMessages(
  messages: LangChainMessage | LangChainMessage[],
): LangChainMessage[] {
  return Array.isArray(messages) ? messages : [messages]
}

export function contentText(content: unknown): string {
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
      if (block && typeof block === 'object' && 'text' in block) {
        const text = (block as { text?: unknown }).text
        return typeof text === 'string' ? text : ''
      }
      return ''
    })
    .join('')
}

export function asMessage(value: unknown): LcMessage | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }
  return value as LcMessage
}

export function messageText(message: unknown): string {
  if (typeof message === 'string') {
    return message
  }

  const parsed = asMessage(message)
  if (!parsed) {
    return ''
  }
  if (parsed.kwargs && 'content' in parsed.kwargs) {
    return contentText(parsed.kwargs.content)
  }
  return contentText(parsed.content)
}

export function messageToolCalls(message: unknown): ToolCall[] {
  const calls = asMessage(message)?.kwargs?.tool_calls
  return Array.isArray(calls) ? calls : []
}

export function extractTextContent(content: unknown): string {
  return contentText(content)
}
