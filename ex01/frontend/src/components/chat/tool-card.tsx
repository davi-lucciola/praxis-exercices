import { Wrench } from 'lucide-react'
import { WeatherCard } from '@/components/chat/weather-card'
import { Badge } from '@/components/ui/badge'
import { messageText } from '@/lib/agent-types'
import type { ToolBlock } from '@/lib/blocks'
import { cn } from '@/lib/utils'
import { cityOf, parseWeather } from '@/lib/weather'

function weatherFromBlock(block: ToolBlock) {
  const city = cityOf(block.input) ?? ''
  if (block.status !== 'done') {
    return { city, status: block.status, temperature: undefined, condition: undefined }
  }

  const parsed = parseWeather(messageText(block.output))
  if (!parsed) {
    return null
  }

  return {
    city: parsed.city || city,
    status: block.status,
    temperature: parsed.temperature,
    condition: parsed.condition,
  }
}

function argSummary(input: unknown): string | null {
  const city = cityOf(input)
  if (city) {
    return city
  }
  if (input === undefined || input === null) {
    return null
  }
  const json = JSON.stringify(input)
  return json === '{}' ? null : json
}

export function ToolCard({ block }: { block: ToolBlock }) {
  if (block.name === 'get_weather') {
    const weather = weatherFromBlock(block)
    if (weather) {
      return <WeatherCard {...weather} />
    }
  }

  const done = block.status === 'done'
  const failed = block.status === 'error'
  const arg = argSummary(block.input)
  const output = done ? messageText(block.output) : ''

  return (
    <section
      aria-live="polite"
      aria-busy={block.status === 'running'}
      className={cn('w-full max-w-sm rounded-xl border border-border bg-card px-4 py-3 shadow-sm')}
    >
      <header className="flex items-center gap-2">
        <Wrench className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <code className="font-mono text-xs">{block.name}</code>
        {arg ? <span className="truncate text-xs text-muted-foreground">{arg}</span> : null}
        <Badge
          variant={failed ? 'destructive' : done ? 'secondary' : 'outline'}
          className="ml-auto"
        >
          {block.status}
        </Badge>
      </header>
      {block.status === 'running' ? (
        <p className="mt-2 text-sm text-muted-foreground">Executando {block.name}…</p>
      ) : null}
      {failed ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          A tool falhou.
        </p>
      ) : null}
      {output ? (
        <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">{output}</pre>
      ) : null}
    </section>
  )
}
