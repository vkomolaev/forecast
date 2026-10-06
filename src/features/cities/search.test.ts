import { describe, expect, it } from 'vitest';
import { normalize, searchCities } from './search';
import type { City } from './types';

const city = (id: number, name: string, country: string): City => ({
  id,
  name,
  country,
  coord: { lat: 0, lon: 0 },
});

const cities = [
  city(1, 'Plzeň', 'CZ'),
  city(2, 'Praděd', 'CZ'),
  city(3, 'Prag', 'DE'),
  city(4, 'Prague', 'US'),
  city(5, 'Prague', 'CZ'),
  city(6, 'Praha', 'CZ'),
  city(7, 'Prato', 'IT'),
  city(8, 'Ústí nad Labem', 'CZ'),
].toSorted((a, b) => (normalize(a.name) < normalize(b.name) ? -1 : 1));

const ids = (query: string, region?: string) => searchCities(cities, query, region).map((c) => c.id);

describe('normalize', () => {
  it('strips diacritics and case', () => {
    expect(normalize(' Ústí nad Labem ')).toBe('usti nad labem');
    expect(normalize('PLZEŇ')).toBe('plzen');
  });
});

describe('searchCities', () => {
  it('ignores queries shorter than two characters', () => {
    expect(ids('p')).toEqual([]);
    expect(ids('  ')).toEqual([]);
  });

  it('matches by prefix regardless of diacritics', () => {
    expect(ids('plzen')).toEqual([1]);
    expect(ids('usti')).toEqual([8]);
  });

  it('returns nothing when no name starts with the query', () => {
    expect(ids('xyz')).toEqual([]);
  });

  it('puts exact matches first, then shorter names', () => {
    expect(ids('prag')).toEqual([3, 4, 5]);
    expect(ids('praha')).toEqual([6]);
  });

  it('prefers cities from the browser region among equal matches', () => {
    expect(ids('prague', 'CZ')).toEqual([5, 4]);
    expect(ids('pra', 'CZ').slice(0, 3)).toEqual([6, 2, 5]);
  });

  it('shows a city only once when it also has an alias', () => {
    const aliased = [city(1, 'Prague', 'CZ'), city(1, 'Praha', 'CZ')];
    expect(searchCities(aliased, 'praha').map((c) => c.name)).toEqual(['Praha']);
    expect(searchCities(aliased, 'pra')).toHaveLength(1);
  });

});

describe('searchCities on the real list', async () => {
  const { readFile } = await import('node:fs/promises');
  const real = JSON.parse(await readFile(new URL('../../../public/cities.json', import.meta.url), 'utf8')) as City[];

  it('keeps the list sorted the way the binary search expects', () => {
    const keys = real.map((c) => normalize(c.name));
    expect(keys.every((key, i) => i === 0 || (keys[i - 1] ?? '') <= key)).toBe(true);
  });

  it('finds Czech cities for a Czech user', () => {
    expect(searchCities(real, 'pra', 'CZ').map((c) => c.name)).toContain('Praha');
    expect(searchCities(real, 'pilsen', 'CZ')[0]?.name).toBe('Pilsen');
    expect(searchCities(real, 'praha', 'CZ')[0]?.name).toBe('Praha');
    expect(searchCities(real, 'plzen', 'CZ')[0]?.name).toBe('Plzeň');
    expect(searchCities(real, 'ceske bud', 'CZ')[0]?.name).toBe('České Budějovice');
  });
});
