import { AssistantMarkdown } from '@/components/chat/assistant-markdown'
import { cn } from '@/lib/utils'

export function MessageBubble({ kind, content }: { kind: 'user' | 'assistant'; content: string }) {
  const isUser = kind === 'user'

  return (
    <div className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      {isUser ? (
        <p
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
            'rounded-br-md bg-primary text-primary-foreground',
          )}
        >
          {content}
        </p>
      ) : (
        <div
          className={cn(
            'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
            'rounded-bl-md border border-border bg-card text-card-foreground',
          )}
        >
          <AssistantMarkdown content={content} />
        </div>
      )}
    </div>
  )
}
