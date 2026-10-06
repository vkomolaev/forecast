type Locales = readonly string[];

const browserLocales = (): Locales => navigator.languages;

const toDate = (seconds: number) => new Date(seconds * 1000);

// Times are already shifted into the city's timezone, so they are formatted as UTC.
const formatDate = (seconds: number, locales: Locales, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locales, { ...options, timeZone: 'UTC' }).format(toDate(seconds));

export const formatDay = (seconds: number, locales = browserLocales()) =>
  formatDate(seconds, locales, { weekday: 'long', day: 'numeric', month: 'long' });

export const formatShortDay = (seconds: number, locales = browserLocales()) =>
  formatDate(seconds, locales, { weekday: 'short' });

export const formatTime = (seconds: number, locales = browserLocales()) =>
  formatDate(seconds, locales, { hour: 'numeric', minute: '2-digit' });

export const formatTemperature = (celsius: number, locales = browserLocales()) =>
  new Intl.NumberFormat(locales, {
    style: 'unit',
    unit: 'celsius',
    maximumFractionDigits: 0,
    signDisplay: 'negative',
  }).format(celsius);

export const formatPercent = (ratio: number, locales = browserLocales()) =>
  new Intl.NumberFormat(locales, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);

export const formatSpeed = (metersPerSecond: number, locales = browserLocales()) =>
  new Intl.NumberFormat(locales, { style: 'unit', unit: 'meter-per-second', maximumFractionDigits: 1 }).format(
    metersPerSecond,
  );

export const formatCountry = (code: string, locales = browserLocales()) =>
  new Intl.DisplayNames(locales, { type: 'region' }).of(code) ?? code;

export const formatCoordinate = (degrees: number, locales = browserLocales()) =>
  new Intl.NumberFormat(locales, { maximumFractionDigits: 2 }).format(degrees);
