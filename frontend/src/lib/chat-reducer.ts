import type { AgentEvent } from '@/lib/agent-types'

export type ChatTurn =
  | { role: 'user'; id: string; content: string }
  | { role: 'assistant'; id: string; events: AgentEvent[] }

export type ChatAction =
  | { type: 'reset' }
  | { type: 'addUser'; id: string; content: string }
  | { type: 'startAssistant'; id: string }
  | { type: 'applyEvent'; event: AgentEvent }

export function chatReducer(turns: ChatTurn[], action: ChatAction): ChatTurn[] {
  if (action.type === 'reset') {
    return []
  }

  if (action.type === 'addUser') {
    return [...turns, { role: 'user', id: action.id, content: action.content }]
  }

  if (action.type === 'startAssistant') {
    return [...turns, { role: 'assistant', id: action.id, events: [] }]
  }

  return appendEvent(turns, action.event)
}

function appendEvent(turns: ChatTurn[], event: AgentEvent): ChatTurn[] {
  for (let index = turns.length - 1; index >= 0; index--) {
    const turn = turns[index]
    if (turn.role !== 'assistant') {
      continue
    }

    const next = [...turns]
    next[index] = { ...turn, events: [...turn.events, { ...event, at: event.at ?? Date.now() }] }
    return next
  }

  return turns
}
