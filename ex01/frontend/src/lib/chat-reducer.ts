import {
  type AgentStreamEvent,
  extractTextContent,
  readCity,
  readTemperature,
} from '@/lib/agent-types'

export type WeatherStatus = 'running' | 'done' | 'error'

export type ChatItem =
  | { kind: 'user'; id: string; content: string }
  | { kind: 'assistant'; id: string; content: string }
  | {
      kind: 'weather'
      id: string
      city: string
      status: WeatherStatus
      temperature?: number
    }

export type ChatAction =
  | { type: 'reset' }
  | { type: 'addUser'; id: string; content: string }
  | { type: 'applyEvent'; event: AgentStreamEvent }

export function chatReducer(items: ChatItem[], action: ChatAction): ChatItem[] {
  if (action.type === 'reset') {
    return []
  }

  if (action.type === 'addUser') {
    return [...items, { kind: 'user', id: action.id, content: action.content }]
  }

  return applyStreamEvent(items, action.event)
}

function applyStreamEvent(items: ChatItem[], event: AgentStreamEvent): ChatItem[] {
  if (event.event === 'on_chat_model_stream') {
    const text = extractTextContent(event.data?.chunk?.content)
    if (!text) {
      return items
    }

    const id = event.run_id ?? 'assistant'
    const index = items.findIndex((item) => item.kind === 'assistant' && item.id === id)
    if (index === -1) {
      return [...items, { kind: 'assistant', id, content: text }]
    }

    const current = items[index]
    if (current.kind !== 'assistant') {
      return items
    }

    const next = [...items]
    next[index] = { ...current, content: `${current.content}${text}` }
    return next
  }

  if (event.event === 'on_tool_start' && event.name === 'get_weather') {
    const id = event.run_id ?? 'weather'
    const city = readCity(event.data?.input)
    const index = items.findIndex((item) => item.kind === 'weather' && item.id === id)
    const weather: ChatItem = { kind: 'weather', id, city, status: 'running' }

    if (index === -1) {
      return [...items, weather]
    }

    const next = [...items]
    next[index] = weather
    return next
  }

  if (event.event === 'on_tool_end' && event.name === 'get_weather') {
    return patchWeather(items, event.run_id, {
      status: 'done',
      city: readCity(event.data?.input),
      temperature: readTemperature(event.data?.output),
    })
  }

  if (event.event === 'on_tool_error' && event.name === 'get_weather') {
    return patchWeather(items, event.run_id, { status: 'error' })
  }

  return items
}

function patchWeather(
  items: ChatItem[],
  runId: string | undefined,
  patch: Partial<Extract<ChatItem, { kind: 'weather' }>>,
): ChatItem[] {
  const id = runId ?? 'weather'
  const index = items.findIndex((item) => item.kind === 'weather' && item.id === id)

  if (index === -1) {
    return [
      ...items,
      {
        kind: 'weather',
        id,
        city: patch.city ?? '',
        status: patch.status ?? 'done',
        temperature: patch.temperature,
      },
    ]
  }

  const current = items[index]
  if (current.kind !== 'weather') {
    return items
  }

  const next = [...items]
  next[index] = {
    ...current,
    ...patch,
    city: patch.city || current.city,
  }
  return next
}
