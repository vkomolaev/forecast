import type { City } from './types';

const MIN_QUERY = 2;
const LIMIT = 10;

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

const lowerBound = (cities: readonly City[], target: string, from = 0, to = cities.length): number => {
  if (from >= to) return from;
  const middle = (from + to) >>> 1;
  return normalize(cities[middle]?.name ?? '') < target
    ? lowerBound(cities, target, middle + 1, to)
    : lowerBound(cities, target, from, middle);
};

interface Match {
  city: City;
  key: string;
}

const byRelevance =
  (query: string, region: string | undefined) =>
  (a: Match, b: Match): number =>
    Number(b.key === query) - Number(a.key === query) ||
    Number(b.city.country === region) - Number(a.city.country === region) ||
    a.key.length - b.key.length ||
    a.city.name.localeCompare(b.city.name);

// Expects cities sorted by normalized name, see scripts/build-cities.ts.
export const searchCities = (cities: readonly City[], query: string, region?: string): City[] => {
  const normalized = normalize(query);
  if (normalized.length < MIN_QUERY) return [];

  const from = lowerBound(cities, normalized);
  const to = lowerBound(cities, `${normalized}￿`, from);

  const ranked = cities
    .slice(from, to)
    .map((city) => ({ city, key: normalize(city.name) }))
    .toSorted(byRelevance(normalized, region));

  // Praha and Prague share an id, keep the better ranked one.
  return [...Map.groupBy(ranked, (match) => match.city.id).values()]
    .slice(0, LIMIT)
    .map(([best]) => best?.city)
    .filter((city) => city !== undefined);
};
