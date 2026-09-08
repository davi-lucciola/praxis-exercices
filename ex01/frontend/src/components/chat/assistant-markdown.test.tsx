import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AssistantMarkdown } from '@/components/chat/assistant-markdown'

describe('AssistantMarkdown', () => {
  it('renders bold, italic, and inline code', () => {
    render(<AssistantMarkdown content="**negrito** e *itálico* e `código`" />)

    expect(screen.getByText('negrito').tagName).toBe('STRONG')
    expect(screen.getByText('itálico').tagName).toBe('EM')
    expect(screen.getByText('código').tagName).toBe('CODE')
  })

  it('renders a safe external link', () => {
    render(<AssistantMarkdown content="veja [INMET](https://www.inmet.gov.br)" />)

    const link = screen.getByRole('link', { name: 'INMET' })
    expect(link).toHaveAttribute('href', 'https://www.inmet.gov.br')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders headings and lists', () => {
    render(<AssistantMarkdown content={`# Recife\n\n- nublado\n- 26°C`} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Recife' })).toBeInTheDocument()
    expect(screen.getByText('nublado').tagName).toBe('LI')
    expect(screen.getByText('26°C').tagName).toBe('LI')
  })
})
