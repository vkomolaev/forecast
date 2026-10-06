import type { City } from '../features/cities/types'

const CITIES_URL = import.meta.env.VITE_CITIES_URL ?? `${import.meta.env.BASE_URL}cities.json`

export const fetchCities = async (): Promise<City[]> => {
  const response = await fetch(CITIES_URL)
  if (!response.ok) throw new Error(`City list request failed with ${String(response.status)}`)
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('City list is not an array')
  return data as City[]
}
