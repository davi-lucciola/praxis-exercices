import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WeatherCard } from '@/components/chat/weather-card'

describe('WeatherCard', () => {
  it('shows a running briefing for the city', () => {
    render(<WeatherCard city="Recife" status="running" />)

    expect(screen.getByText('Lendo a estação…')).toBeInTheDocument()
    expect(screen.getByText('Recife')).toBeInTheDocument()
    expect(screen.getByLabelText('Briefing de Recife')).toHaveAttribute('aria-busy', 'true')
  })

  it('shows the temperature when the tool finishes', () => {
    render(<WeatherCard city="Recife" status="done" temperature={26} condition="nublado" />)

    expect(screen.getByText('26')).toBeInTheDocument()
    expect(screen.getByText('°C')).toBeInTheDocument()
    expect(screen.getByText('nublado')).toBeInTheDocument()
    expect(screen.queryByText('Lendo a estação…')).not.toBeInTheDocument()
  })
})
