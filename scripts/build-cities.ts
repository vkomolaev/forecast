// Builds public/cities.json from the OpenWeatherMap city list.
// Usage: npm run cities [-- path/to/city.list.json.gz]
import { readFile, writeFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'
import { normalize } from '../src/features/cities/search.ts'
import type { City } from '../src/features/cities/types.ts'

const SOURCE_URL = 'https://bulk.openweathermap.org/sample/city.list.json.gz'
const TARGET = new URL('../public/cities.json', import.meta.url)

interface OwmCity extends City {
  state: string
}

const download = async (source: string | undefined) =>
  source ? readFile(source) : Buffer.from(await (await fetch(SOURCE_URL)).arrayBuffer())

const round = (value: number) => Math.round(value * 100) / 100

const isUsable = (city: OwmCity) => city.country !== '' && city.name.trim() !== ''

const toCity = ({ id, name, country, coord }: OwmCity): City => ({
  id,
  name,
  country,
  coord: { lat: round(coord.lat), lon: round(coord.lon) },
})

const identity = (city: City) => [normalize(city.name), city.country, city.coord.lat, city.coord.lon].join('|')

const dedupe = (cities: City[]) => [...new Map(cities.map((city) => [identity(city), city])).values()]

const byKey = (a: City, b: City) => {
  const [left, right] = [normalize(a.name), normalize(b.name)]
  return left < right ? -1 : left > right ? 1 : 0
}

const build = (raw: Buffer): City[] =>
  dedupe((JSON.parse(gunzipSync(raw).toString('utf8')) as OwmCity[]).filter(isUsable).map(toCity)).toSorted(byKey)

const cities = build(await download(process.argv[2]))
await writeFile(TARGET, JSON.stringify(cities))
console.log(`Wrote ${String(cities.length)} cities to ${TARGET.pathname}`)
