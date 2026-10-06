import type { Lang } from '../i18n/i18n';
import { isNumber, isRecord } from '../lib/guards';
import type { OwmForecastResponse } from './types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const TIMEOUT_MS = 15_000;

export type ForecastError = 'missing-key' | 'invalid-key' | 'not-found' | 'rate-limit' | 'network' | 'invalid-response';

export type ForecastResult =
  | { ok: true; data: OwmForecastResponse }
  | { ok: false; error: ForecastError };

interface ForecastQuery {
  lat: number;
  lon: number;
  lang: Lang;
}

// OWM wants 'cz', not 'cs'.
const OWM_LANG: Record<Lang, string> = { en: 'en', cs: 'cz' };

const ERROR_BY_STATUS: Partial<Record<number, ForecastError>> = {
  401: 'invalid-key',
  404: 'not-found',
  429: 'rate-limit',
};

const isWeather = (value: unknown) =>
  isRecord(value) &&
  isNumber(value.id) &&
  typeof value.main === 'string' &&
  typeof value.description === 'string' &&
  typeof value.icon === 'string';

const isItem = (item: unknown) =>
  isRecord(item) &&
  isNumber(item.dt) &&
  isRecord(item.main) &&
  isNumber(item.main.temp) &&
  isNumber(item.main.feels_like) &&
  isNumber(item.main.humidity) &&
  Array.isArray(item.weather) &&
  item.weather.every(isWeather) &&
  isRecord(item.wind) &&
  isNumber(item.wind.speed) &&
  isNumber(item.pop);

const isForecastResponse = (value: unknown): value is OwmForecastResponse =>
  isRecord(value) &&
  isRecord(value.city) &&
  isNumber(value.city.id) &&
  typeof value.city.name === 'string' &&
  typeof value.city.country === 'string' &&
  isNumber(value.city.timezone) &&
  Array.isArray(value.list) &&
  value.list.length > 0 &&
  value.list.every(isItem);

export const fetchForecast = async (
  { lat, lon, lang }: ForecastQuery,
  signal: AbortSignal,
): Promise<ForecastResult> => {
  const apiKey = import.meta.env.VITE_OWM_API_KEY;
  if (!apiKey) return { ok: false, error: 'missing-key' };

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: 'metric',
    lang: OWM_LANG[lang],
    appid: apiKey,
  });

  try {
    const response = await fetch(`${BASE_URL}?${params}`, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(TIMEOUT_MS)]),
    });
    if (!response.ok) return { ok: false, error: ERROR_BY_STATUS[response.status] ?? 'network' };
    const data: unknown = await response.json();
    return isForecastResponse(data) ? { ok: true, data } : { ok: false, error: 'invalid-response' };
  } catch (error) {
    if (signal.aborted) throw error;
    return { ok: false, error: 'network' };
  }
};
