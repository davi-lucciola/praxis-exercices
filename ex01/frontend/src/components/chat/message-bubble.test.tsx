import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MessageBubble } from '@/components/chat/message-bubble'

describe('MessageBubble', () => {
  it('keeps user markdown as literal text', () => {
    render(<MessageBubble item={{ kind: 'user', id: 'u1', content: '**não parsear**' }} />)

    expect(screen.getByText('**não parsear**')).toBeInTheDocument()
    expect(screen.queryByText('não parsear')).not.toBeInTheDocument()
  })

  it('parses markdown in assistant messages', () => {
    render(<MessageBubble item={{ kind: 'assistant', id: 'a1', content: '**nublado**' }} />)

    expect(screen.getByText('nublado').tagName).toBe('STRONG')
  })
})
