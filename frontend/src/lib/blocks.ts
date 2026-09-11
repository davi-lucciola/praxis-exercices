import {
  type AgentEvent,
  messageText,
  messageToolCalls,
  UnknownEventError,
} from '@/lib/agent-types'

export type TextBlock = {
  kind: 'text'
  id: string
  text: string
  streaming: boolean
}

export type ToolStatus = 'running' | 'done' | 'error'

export type ToolBlock = {
  kind: 'tool'
  id: string
  name: string
  input: unknown
  output?: unknown
  status: ToolStatus
  startedAt?: number
  endedAt?: number
}

export type Block = TextBlock | ToolBlock

/**
 * Fold the event log into typed blocks. One text block per model pass,
 * one tool block per `run_id`. `on_tool_end` mutates the card it belongs to.
 */
export function foldEvents(events: AgentEvent[]): Block[] {
  const blocks: Block[] = []
  for (const [index, event] of events.entries()) {
    apply(blocks, event, index)
  }
  return blocks
}

function apply(blocks: Block[], event: AgentEvent, index: number): void {
  const id = String(event.data.run_id ?? `evt-${index}`)
  switch (event.type) {
    case 'on_chat_model_start':
      blocks.push({ kind: 'text', id, text: '', streaming: true })
      return
    case 'on_chat_model_stream': {
      const piece = messageText(event.data.data?.chunk)
      if (!piece) {
        return
      }
      const open = openText(blocks) ?? pushText(blocks, id)
      open.text += piece
      return
    }
    case 'on_chat_model_end': {
      const open = openText(blocks)
      if (!open) {
        return
      }
      const output = event.data.data?.output
      if (messageToolCalls(output).length > 0) {
        blocks.splice(blocks.indexOf(open), 1)
        return
      }
      open.text = messageText(output) || open.text
      open.streaming = false
      return
    }
    case 'on_tool_start':
      blocks.push({
        kind: 'tool',
        id,
        name: event.data.name ?? 'tool',
        input: event.data.data?.input,
        status: 'running',
        startedAt: event.at,
      })
      return
    case 'on_tool_end': {
      const tool = findTool(blocks, id) ?? lastRunningTool(blocks)
      if (!tool) {
        return
      }
      tool.output = event.data.data?.output
      tool.status = 'done'
      tool.endedAt = event.at
      return
    }
    case 'on_tool_error': {
      const tool = findTool(blocks, id) ?? lastRunningTool(blocks)
      if (!tool) {
        return
      }
      tool.status = 'error'
      tool.endedAt = event.at
      return
    }
    default:
      throw new UnknownEventError((event as { type: string }).type)
  }
}

function openText(blocks: Block[]): TextBlock | undefined {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    if (block.kind === 'text') {
      return block.streaming ? block : undefined
    }
  }
  return undefined
}

function pushText(blocks: Block[], id: string): TextBlock {
  const block: TextBlock = { kind: 'text', id, text: '', streaming: true }
  blocks.push(block)
  return block
}

function findTool(blocks: Block[], id: string): ToolBlock | undefined {
  return blocks.find((b): b is ToolBlock => b.kind === 'tool' && b.id === id)
}

function lastRunningTool(blocks: Block[]): ToolBlock | undefined {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    if (block.kind === 'tool' && block.status === 'running') {
      return block
    }
  }
  return undefined
}

/** True while the model is working but has nothing visible yet. */
export function isThinking(blocks: Block[]): boolean {
  const last = blocks.at(-1)
  if (!last) {
    return true
  }
  if (last.kind === 'tool') {
    return last.status === 'done'
  }
  return last.streaming && last.text.length === 0
}
