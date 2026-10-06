# Forecast

A small single-page app that shows a 5-day weather forecast for a selected city, using the OpenWeatherMap API.

> Work in progress.

## Getting started

1. Get a free API key at [OpenWeatherMap](https://home.openweathermap.org/api_keys). A new key can take up to a couple of hours to activate.
2. Copy `.env.example` to `.env.local` and put the key there:
   ```sh
   cp .env.example .env.local
   ```
3. Install and run:
   ```sh
   npm install
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check and production build into `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run cities` | Rebuild `public/cities.json` from the OpenWeatherMap city list |

## City list

The autocomplete uses the [OpenWeatherMap city list](https://bulk.openweathermap.org/sample/). The original file is about 45 MB, so `npm run cities` downloads it and keeps the same format but drops the unused `state` field, entries without a country and duplicates, and rounds coordinates to two decimals (~1 km). The result (~196k cities, 16.5 MB, 2.8 MB gzipped) is committed as `public/cities.json` and sorted by normalized name, so the search is a binary search over a prefix range.

City names come from OpenWeatherMap as is, which means English names for big cities (`Prague`, `Pilsen`).
