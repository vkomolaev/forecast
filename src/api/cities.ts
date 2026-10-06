import type { City } from '../features/cities/types';
import { isNumber, isRecord } from '../lib/guards';

const LOCAL_URL = `${import.meta.env.BASE_URL}cities.json`;
const REMOTE_URL = import.meta.env.VITE_CITIES_URL;
const TIMEOUT_MS = 60_000;

export const isCity = (value: unknown): value is City =>
  isRecord(value) &&
  isNumber(value.id) &&
  typeof value.name === 'string' && value.name.trim().length > 0 &&
  typeof value.country === 'string' && /^[A-Z]{2}$/.test(value.country) &&
  isRecord(value.coord) &&
  isNumber(value.coord.lat) && Math.abs(value.coord.lat) <= 90 &&
  isNumber(value.coord.lon) && Math.abs(value.coord.lon) <= 180;

const fetchList = async (url: string): Promise<City[]> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`City list request failed with ${String(response.status)}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0 || !data.every(isCity)) {
    throw new Error('Invalid city list');
  }
  return data;
};

export const fetchCities = async (): Promise<City[]> =>
  REMOTE_URL ? fetchList(REMOTE_URL).catch(() => fetchList(LOCAL_URL)) : fetchList(LOCAL_URL);
