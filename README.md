# Forecast

A single-page app that shows a 5-day weather forecast for a city, using the [OpenWeatherMap](https://openweathermap.org/forecast5) API.

**Live demo:** https://vkomolaev.github.io/forecast/

![Forecast for Prague](docs/screenshot.png)

## Features

- City search with autocomplete over the OpenWeatherMap city list, diacritics-insensitive (`ceske bud` finds České Budějovice), keyboard friendly.
- 5 days as a list; each day shows the high and low and expands into a table of 3-hour slots: temperature, feels like, wind, humidity, chance of precipitation.
- Temperature chart for the whole period.
- Forecast for the current location.
- Dates, times and numbers are formatted by the browser locale. Times are shown in the city's own time zone, so Tokyo shows Tokyo time.
- English and Czech interface, picked from the browser languages and switchable. The switch changes texts, country names and weather descriptions. Dates, times and numbers always follow the browser locale, as the assignment asks, so a Ukrainian browser with the Czech interface shows Ukrainian dates.
- Light and dark theme, following the system by default or set by hand.
- The last chosen city, language and theme are remembered.

## Getting started

Requires Node.js 24.

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

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type check and production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) for search, forecast transform, formatting, i18n and sagas |
| `npm run cities` | Rebuild `public/cities.json` from the OpenWeatherMap city list |

Pushes to `main` are deployed to GitHub Pages by `.github/workflows/deploy.yml`. The API key comes from the `OWM_API_KEY` repository secret.

## Supported browsers

Latest Chrome, Firefox and Edge, on desktop and mobile. Safari was not tested.

## Tech stack

- React 19 with React Compiler, TypeScript, Vite
- Redux Toolkit and redux-saga
- Sass (CSS Modules)
- Recharts for the chart
- Vitest

No UI kits, date or i18n libraries: formatting is done with `Intl`, translations are two plain dictionaries.

## Project structure

```
scripts/
  build-cities.ts       builds public/cities.json from the OpenWeatherMap city list
public/
  cities.json           city list, OpenWeatherMap format
src/
  api/                  OpenWeatherMap and city list requests, the only places that call fetch
  app/                  store, root saga, typed hooks
  features/
    cities/             search index, autocomplete, city list loading
    forecast/           forecast slice and saga, API response transform, list, day card, chart
    geolocation/        "use my location"
    theme/              theme switch
  i18n/                 dictionaries, language detection, language switch
  lib/                  Intl formatters, guarded localStorage
  styles/               global tokens and mixins
```

Each feature keeps its slice, saga, components and pure logic side by side. Data flows one way:

- Components dispatch actions (`locationSelected`, `queryChanged`, `langChanged`, …) and read state through selectors.
- Sagas react to the actions, call the API and dispatch the results.
- Reducers and selectors are pure, and so are the transforms (`transform.ts`, `chartData.ts`, `search.ts`), which is what the tests cover.

## Decisions

**Functional style.** The assignment asks for one paradigm; this is functional throughout. There are no classes (an ESLint rule bans them), state is immutable, and side effects live only in sagas and `src/api`. API errors are returned as values (`{ ok: false, error }`) rather than thrown.

**Why Redux and redux-saga.** They are named in the assignment, and they fit the functional style: reducers are pure, and sagas describe effects as data, so they can be tested step by step without mocking `fetch`. They also handle the race when the city is changed quickly: `takeLatest` cancels the previous request and the saga aborts its `fetch`. For an app this size it is more than needed. In production I would use local React state with TanStack Query or RTK Query.

**City list.** The OpenWeatherMap `city.list.json.gz` is about 45 MB unpacked and is served without CORS headers, so the browser cannot load it directly. `npm run cities` downloads it and keeps the same format, but:

- drops the unused `state` field, entries without a country and duplicates;
- rounds coordinates to two decimals (~1 km);
- sorts by normalized name, so the search is a binary search over a prefix range.

The result has ~196k cities, 16.5 MB, 2.8 MB gzipped. The production build loads it online from this repository through jsDelivr and falls back to the bundled copy. The index lives inside the cities saga rather than in the store, because 200k records would only slow Redux down.

OpenWeatherMap uses English names for a couple of Czech cities (`Prague`, `Pilsen`), so the script also adds their Czech names (`Praha`, `Plzeň`) as extra entries with the same id. Results are ranked by exact match, then by the country of the browser locale, then by name length. The list has no population data, so a big city cannot be ranked above a village with a shorter name.

**Own autocomplete.** `<datalist>` cannot handle 200k options or return the selected city's id, so the combobox follows the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

**5 days.** The free API returns 40 three-hour slots. They are grouped by the city's local date and the first five days are shown, so today may have only a few evening slots left.

**API key.** It is a `VITE_` variable, so it ends up in the client bundle. That is unavoidable without a backend, and acceptable for a free key that can be rotated at any time.
