import { describe, expect, it } from 'vitest'

import { readTemperature } from '@/lib/agent-types'

describe('readTemperature', () => {
  it('reads a number', () => {
    expect(readTemperature(26)).toBe(26)
  })

  it('reads an object with temperature', () => {
    expect(readTemperature({ temperature: 26 })).toBe(26)
  })

  it('reads a JSON string', () => {
    expect(readTemperature('{"temperature": 26}')).toBe(26)
  })

  it('reads a ToolMessage with JSON content', () => {
    expect(
      readTemperature({
        content: '{"temperature": 26}',
        type: 'tool',
        name: 'get_weather',
      }),
    ).toBe(26)
  })

  it('reads a ToolMessage with a Pydantic string', () => {
    expect(
      readTemperature({
        content: 'temperature=26.0',
        type: 'tool',
        name: 'get_weather',
      }),
    ).toBe(26)
  })

  it('reads a Pydantic model repr', () => {
    expect(readTemperature('WeatherOut(temperature=26.0)')).toBe(26)
  })
})
