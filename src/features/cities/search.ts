import type { City } from './types'

export interface CityIndex {
  keys: readonly string[]
  cities: readonly City[]
}

const MIN_QUERY = 2
const LIMIT = 10

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

/** Expects cities sorted by normalized name, which is how the build script writes them. */
export const createIndex = (cities: readonly City[]): CityIndex => ({
  keys: cities.map((city) => normalize(city.name)),
  cities,
})

const lowerBound = (keys: readonly string[], target: string, from = 0, to = keys.length): number => {
  if (from >= to) return from
  const middle = (from + to) >>> 1
  return (keys[middle] ?? '') < target
    ? lowerBound(keys, target, middle + 1, to)
    : lowerBound(keys, target, from, middle)
}

interface Match {
  city: City
  key: string
}

const byRelevance =
  (query: string, region: string | undefined) =>
  (a: Match, b: Match): number =>
    Number(b.key === query) - Number(a.key === query) ||
    Number(b.city.country === region) - Number(a.city.country === region) ||
    a.key.length - b.key.length ||
    a.city.name.localeCompare(b.city.name)

export const searchCities = (index: CityIndex, query: string, region?: string): City[] => {
  const normalized = normalize(query)
  if (normalized.length < MIN_QUERY) return []

  const from = lowerBound(index.keys, normalized)
  const to = lowerBound(index.keys, `${normalized}￿`, from)

  const ranked = index.cities
    .slice(from, to)
    .map((city, offset) => ({ city, key: index.keys[from + offset] ?? '' }))
    .toSorted(byRelevance(normalized, region))

  // An alias shares the id of its original city, so keep the better ranked one.
  return [...Map.groupBy(ranked, (match) => match.city.id).values()]
    .slice(0, LIMIT)
    .map(([best]) => best?.city)
    .filter((city) => city !== undefined)
}
