import type { Lang } from '../i18n/i18n'
import type { OwmForecastResponse } from './types'

const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast'

export type ForecastError = 'missing-key' | 'invalid-key' | 'not-found' | 'rate-limit' | 'network'

export type ForecastResult =
  | { ok: true; data: OwmForecastResponse }
  | { ok: false; error: ForecastError }

interface ForecastQuery {
  lat: number
  lon: number
  lang: Lang
}

// OpenWeatherMap uses the country code for Czech.
const OWM_LANG: Record<Lang, string> = { en: 'en', cs: 'cz' }

const errorByStatus = (status: number): ForecastError => {
  switch (status) {
    case 401:
      return 'invalid-key'
    case 404:
      return 'not-found'
    case 429:
      return 'rate-limit'
    default:
      return 'network'
  }
}

export const fetchForecast = async (
  { lat, lon, lang }: ForecastQuery,
  signal: AbortSignal,
): Promise<ForecastResult> => {
  const apiKey = import.meta.env.VITE_OWM_API_KEY
  if (!apiKey) return { ok: false, error: 'missing-key' }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: 'metric',
    lang: OWM_LANG[lang],
    appid: apiKey,
  })

  try {
    const response = await fetch(`${BASE_URL}?${params}`, { signal })
    if (!response.ok) return { ok: false, error: errorByStatus(response.status) }
    return { ok: true, data: (await response.json()) as OwmForecastResponse }
  } catch (error) {
    if (signal.aborted) throw error
    return { ok: false, error: 'network' }
  }
}
