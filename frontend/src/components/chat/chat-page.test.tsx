import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { ChatPage } from '@/components/chat/chat-page'

describe('ChatPage', () => {
  it('renders the empty briefing and composer', () => {
    render(<ChatPage />)

    expect(screen.getByRole('heading', { name: 'Praxis WX' })).toBeInTheDocument()
    expect(screen.getByText('Pergunte por uma cidade')).toBeInTheDocument()
    expect(screen.getByText('Eu devolvo o briefing.')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('starts a new station and clears the transcript', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const station = screen.getByText(/STN /)
    const previousStation = station.textContent

    await user.type(screen.getByLabelText('Mensagem'), 'tempo em Recife')
    await user.click(screen.getByRole('button', { name: 'Novo chat' }))

    expect(screen.getByText('Pergunte por uma cidade')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensagem')).toHaveValue('')
    expect(screen.getByText(/STN /).textContent).not.toEqual(previousStation)
  })
})
