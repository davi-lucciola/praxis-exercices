import { CloudSun } from 'lucide-react'

import type { ChatItem } from '@/lib/chat-reducer'
import { cn } from '@/lib/utils'

export function WeatherCard({ item }: { item: Extract<ChatItem, { kind: 'weather' }> }) {
  return (
    <article
      aria-busy={item.status === 'running'}
      aria-label={`Briefing de ${item.city || 'estação'}`}
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        'ring-1 ring-accent/30',
      )}
    >
      <div className="flex items-center justify-between bg-accent px-4 py-2 text-accent-foreground">
        <p className="font-display text-sm tracking-[0.18em] uppercase">Briefing</p>
        <p className="font-mono text-xs tracking-widest uppercase">{item.city || '—'}</p>
      </div>
      <div className="space-y-2 px-4 py-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CloudSun className="size-4" aria-hidden="true" />
          <p className="text-xs tracking-wide uppercase">Temperatura</p>
        </div>
        {item.status === 'running' ? (
          <p className="text-sm text-muted-foreground">Lendo a estação…</p>
        ) : null}
        {item.status === 'done' ? (
          <p className="font-display text-6xl leading-none tracking-tight text-foreground">
            {item.temperature}
            <span className="ml-1 text-3xl text-muted-foreground">°C</span>
          </p>
        ) : null}
        {item.status === 'error' ? (
          <p role="alert" className="text-sm text-destructive">
            Não deu para ler essa estação. Tente de novo.
          </p>
        ) : null}
      </div>
    </article>
  )
}
