import { describe, expect, it } from 'vitest'

import { parseWeather } from '@/lib/weather'

describe('parseWeather', () => {
  it('reads a stable JSON payload', () => {
    expect(parseWeather('{"city":"Recife","temperature":26,"condition":"nublado"}')).toEqual({
      city: 'Recife',
      temperature: 26,
      condition: 'nublado',
    })
  })

  it('returns null for a Pydantic repr', () => {
    expect(parseWeather('WeatherOut(temperature=26.0)')).toBeNull()
  })

  it('returns null for invalid JSON', () => {
    expect(parseWeather('not-json')).toBeNull()
  })
})
