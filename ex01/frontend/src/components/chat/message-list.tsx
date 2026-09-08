import { MessageBubble } from '@/components/chat/message-bubble'
import { WeatherCard } from '@/components/chat/weather-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChatItem } from '@/lib/chat-reducer'

export function MessageList({ items, isLoading }: { items: ChatItem[]; isLoading: boolean }) {
  if (items.length === 0) {
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

  return (
    <ScrollArea className="flex-1" aria-busy={isLoading}>
      <div className="flex flex-col gap-4 px-4 py-6">
        {items.map((item) => {
          if (item.kind === 'weather') {
            return <WeatherCard key={item.id} item={item} />
          }
          return <MessageBubble key={item.id} item={item} />
        })}
      </div>
    </ScrollArea>
  )
}
