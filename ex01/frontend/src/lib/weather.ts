export type Weather = {
  city: string
  temperature: number
  condition: string
}

/** Parse the `get_weather` JSON. Anything else returns null. */
export function parseWeather(text: string): Weather | null {
  try {
    const raw = JSON.parse(text) as Record<string, unknown>
    if (typeof raw.city !== 'string' || typeof raw.temperature !== 'number') {
      return null
    }
    return {
      city: raw.city,
      temperature: raw.temperature,
      condition: typeof raw.condition === 'string' ? raw.condition : '',
    }
  } catch {
    return null
  }
}

export function cityOf(input: unknown): string | null {
  if (!input || typeof input !== 'object') {
    return null
  }
  const city = (input as { city?: unknown }).city
  return typeof city === 'string' ? city : null
}
