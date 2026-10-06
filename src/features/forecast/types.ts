import type { City } from '../cities/types';

export type Location = { kind: 'city'; city: City } | { kind: 'coords'; lat: number; lon: number };

// Unix seconds shifted to the city's local time.
export interface Slot {
  time: number;
  temp: number;
  feelsLike: number;
  icon: string;
  description: string;
  windSpeed: number;
  humidity: number;
  pop: number;
}

export interface Day {
  date: number;
  isToday: boolean;
  min: number;
  max: number;
  icon: string;
  description: string;
  slots: Slot[];
}

export interface Forecast {
  cityName: string;
  country: string;
  days: Day[];
}
