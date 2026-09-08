import { MessageBubble } from '@/components/chat/message-bubble'
import { renderBlock, Thinking } from '@/components/chat/renderers'
import { ScrollArea } from '@/components/ui/scroll-area'
import { foldEvents, isThinking } from '@/lib/blocks'
import type { ChatTurn } from '@/lib/chat-reducer'

export function MessageList({ turns, isLoading }: { turns: ChatTurn[]; isLoading: boolean }) {
  if (turns.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="font-display text-4xl tracking-wide text-foreground uppercase">
          Pergunte por uma cidade
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Eu devolvo o briefing.
        </p>
      </div>
    )
  }

  const lastId = turns.at(-1)?.id

  return (
    <ScrollArea className="flex-1" aria-busy={isLoading}>
      <div className="flex flex-col gap-4 px-4 py-6">
        {turns.map((turn) => {
          if (turn.role === 'user') {
            return <MessageBubble key={turn.id} kind="user" content={turn.content} />
          }

          const blocks = foldEvents(turn.events)
          const live = isLoading && turn.id === lastId

          return (
            <div key={turn.id} className="flex flex-col gap-3">
              {blocks.map(renderBlock)}
              {live && isThinking(blocks) ? <Thinking /> : null}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
