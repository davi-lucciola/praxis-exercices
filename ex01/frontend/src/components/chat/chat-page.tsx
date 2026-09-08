import { ChatComposer } from '@/components/chat/chat-composer'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageList } from '@/components/chat/message-list'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useWeatherChat } from '@/hooks/use-weather-chat'

export function ChatPage() {
  const { threadId, items, isLoading, error, submit, newChat } = useWeatherChat()

  return (
    <TooltipProvider>
      <div className="wx-desk flex min-h-svh justify-center px-3 py-4 md:px-6 md:py-8">
        <div className="flex min-h-[calc(100svh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm md:min-h-[calc(100svh-4rem)]">
          <ChatHeader threadId={threadId} onNewChat={newChat} />
          <MessageList items={items} isLoading={isLoading} />
          {error ? (
            <p role="alert" className="px-4 pb-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <ChatComposer
            key={threadId}
            disabled={isLoading}
            onSubmit={(content) => {
              void submit({ messages: [{ type: 'human', content }] })
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
