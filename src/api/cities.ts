import type { City } from '../features/cities/types'

const LOCAL_URL = `${import.meta.env.BASE_URL}cities.json`
const REMOTE_URL = import.meta.env.VITE_CITIES_URL

const fetchList = async (url: string): Promise<City[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`City list request failed with ${String(response.status)}`)
  const data: unknown = await response.json()
  if (!Array.isArray(data)) throw new Error('City list is not an array')
  return data as City[]
}

// The bundled copy is a fallback for when the CDN is unreachable.
export const fetchCities = async (): Promise<City[]> =>
  REMOTE_URL ? fetchList(REMOTE_URL).catch(() => fetchList(LOCAL_URL)) : fetchList(LOCAL_URL)
