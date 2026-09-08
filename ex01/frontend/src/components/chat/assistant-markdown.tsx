import Markdown, { type Components } from 'react-markdown'

import { cn } from '@/lib/utils'

const ALLOWED_ELEMENTS = [
  'p',
  'strong',
  'em',
  'code',
  'a',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
]

const headingClass = 'mb-2 font-semibold last:mb-0'

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ children }) => (
    <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[0.8125rem]">{children}</code>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className={cn(headingClass, 'text-base')}>{children}</h1>,
  h2: ({ children }) => <h2 className={cn(headingClass, 'text-sm')}>{children}</h2>,
  h3: ({ children }) => <h3 className={cn(headingClass, 'text-sm')}>{children}</h3>,
  h4: ({ children }) => <h4 className={cn('mb-1.5 text-sm font-medium last:mb-0')}>{children}</h4>,
}

export function AssistantMarkdown({ content }: { content: string }) {
  return (
    <Markdown allowedElements={ALLOWED_ELEMENTS} unwrapDisallowed components={components}>
      {content}
    </Markdown>
  )
}
