import { CloudSun, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function ChatHeader({ threadId, onNewChat }: { threadId: string; onNewChat: () => void }) {
  const stationId = threadId.replaceAll('-', '').slice(0, 8)

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3">
      <div className="flex min-w-0 items-baseline gap-3">
        <div className="flex items-center gap-2">
          <CloudSun className="size-5 text-accent" aria-hidden="true" />
          <h1 className="font-display text-2xl tracking-[0.14em] text-foreground uppercase">
            Praxis WX
          </h1>
        </div>
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          STN {stationId}
        </p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" className="cursor-pointer" onClick={onNewChat}>
            <Plus aria-hidden="true" />
            Novo chat
          </Button>
        </TooltipTrigger>
        <TooltipContent>Começa uma conversa em outra estação</TooltipContent>
      </Tooltip>
    </header>
  )
}
