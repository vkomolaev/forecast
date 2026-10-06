type Locales = readonly string[]

const browserLocales = (): Locales => navigator.languages

const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const numberFormatters = new Map<string, Intl.NumberFormat>()
const regionNames = new Map<string, Intl.DisplayNames>()

const cached = <T>(cache: Map<string, T>, key: string, create: () => T): T => {
  const hit = cache.get(key)
  if (hit) return hit
  const created = create()
  cache.set(key, created)
  return created
}

// Times are pre-shifted into the city's timezone, so they are always formatted as UTC.
const dateFormat = (locales: Locales, options: Intl.DateTimeFormatOptions) =>
  cached(dateFormatters, JSON.stringify([locales, options]), () =>
    new Intl.DateTimeFormat(locales, { ...options, timeZone: 'UTC' }),
  )

const numberFormat = (locales: Locales, options: Intl.NumberFormatOptions) =>
  cached(numberFormatters, JSON.stringify([locales, options]), () => new Intl.NumberFormat(locales, options))

const toDate = (seconds: number) => new Date(seconds * 1000)

export const formatDay = (seconds: number, locales = browserLocales()) =>
  dateFormat(locales, { weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(seconds))

export const formatShortDay = (seconds: number, locales = browserLocales()) =>
  dateFormat(locales, { weekday: 'short' }).format(toDate(seconds))

export const formatTime = (seconds: number, locales = browserLocales()) =>
  dateFormat(locales, { hour: 'numeric', minute: '2-digit' }).format(toDate(seconds))

export const formatTemperature = (celsius: number, locales = browserLocales()) =>
  numberFormat(locales, { style: 'unit', unit: 'celsius', maximumFractionDigits: 0, signDisplay: 'negative' }).format(celsius)

export const formatPercent = (ratio: number, locales = browserLocales()) =>
  numberFormat(locales, { style: 'percent', maximumFractionDigits: 0 }).format(ratio)

export const formatSpeed = (metersPerSecond: number, locales = browserLocales()) =>
  numberFormat(locales, { style: 'unit', unit: 'meter-per-second', maximumFractionDigits: 1 }).format(
    metersPerSecond,
  )

export const formatCountry = (code: string, locales = browserLocales()) =>
  cached(regionNames, JSON.stringify(locales), () => new Intl.DisplayNames(locales, { type: 'region' })).of(code) ??
  code

export const formatCoordinate = (degrees: number, locales = browserLocales()) =>
  numberFormat(locales, { maximumFractionDigits: 2 }).format(degrees)
