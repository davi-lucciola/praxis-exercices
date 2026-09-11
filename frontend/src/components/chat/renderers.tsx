import type { ReactNode } from 'react'

import { MessageBubble } from '@/components/chat/message-bubble'
import { ToolCard } from '@/components/chat/tool-card'
import type { Block, TextBlock } from '@/lib/blocks'

function TextView({ block }: { block: TextBlock }) {
  if (!block.text) {
    return null
  }
  return <MessageBubble kind="assistant" content={block.text} />
}

export function renderBlock(block: Block): ReactNode {
  switch (block.kind) {
    case 'text':
      return <TextView key={block.id} block={block} />
    case 'tool':
      return <ToolCard key={block.id} block={block} />
  }
}

export function Thinking() {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      Pensando…
    </p>
  )
}
