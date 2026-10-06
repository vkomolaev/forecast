import { call, cancelled, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import type { SagaIterator } from 'redux-saga'
import { fetchForecast, type ForecastResult } from '../../api/openWeather'
import { selectLang } from '../../i18n/i18nSlice'
import { readJson, writeJson } from '../../lib/storage'
import type { Lang } from '../../i18n/i18n'
import {
  forecastFailed,
  forecastLoaded,
  locationSelected,
  retryRequested,
  selectLocation,
} from './forecastSlice'
import { toForecast } from './transform'
import type { Location } from './types'

const coordsOf = (location: Location) =>
  location.kind === 'city' ? location.city.coord : { lat: location.lat, lon: location.lon }

const nowSeconds = () => Math.floor(Date.now() / 1000)

export function* loadForecast(): SagaIterator {
  const location = (yield select(selectLocation)) as Location | null
  if (!location) return

  const lang = (yield select(selectLang)) as Lang
  const controller = new AbortController()
  try {
    const result = (yield call(
      fetchForecast,
      { ...coordsOf(location), lang },
      controller.signal,
    )) as ForecastResult
    if (!result.ok) {
      yield put(forecastFailed(result.error))
      return
    }
    const now = (yield call(nowSeconds)) as number
    yield put(forecastLoaded(toForecast(result.data, now)))
  } finally {
    if ((yield cancelled()) as boolean) controller.abort()
  }
}

const STORAGE_KEY = 'forecast.location'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

// Stored data is untrusted: anything that does not look like a Location is ignored.
export const parseLocation = (value: unknown): Location | null => {
  if (typeof value !== 'object' || value === null) return null
  const candidate = value as Partial<Record<string, unknown>>
  if (candidate.kind === 'coords') {
    return isNumber(candidate.lat) && isNumber(candidate.lon)
      ? { kind: 'coords', lat: candidate.lat, lon: candidate.lon }
      : null
  }
  if (candidate.kind !== 'city' || typeof candidate.city !== 'object' || candidate.city === null) return null
  const { id, name, country, coord } = candidate.city as Partial<Record<string, unknown>>
  const { lat, lon } = (coord ?? {}) as Partial<Record<string, unknown>>
  return isNumber(id) && typeof name === 'string' && typeof country === 'string' && isNumber(lat) && isNumber(lon)
    ? { kind: 'city', city: { id, name, country, coord: { lat, lon } } }
    : null
}

function* rememberLocation(action: ReturnType<typeof locationSelected>): SagaIterator {
  yield call(writeJson, STORAGE_KEY, action.payload)
}

export function* forecastSaga(): SagaIterator {
  yield takeLatest([locationSelected.type, retryRequested.type], loadForecast)
  yield takeEvery(locationSelected.type, rememberLocation)

  const saved = parseLocation(yield call(readJson, STORAGE_KEY))
  if (saved) yield put(locationSelected(saved))
}
