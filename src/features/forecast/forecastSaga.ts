import { call, cancelled, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { isCity } from '../../api/cities';
import { fetchForecast, type ForecastResult } from '../../api/openWeather';
import { langChanged, selectLang } from '../../i18n/i18nSlice';
import { isNumber, isRecord } from '../../lib/guards';
import { readJson, writeJson } from '../../lib/storage';
import type { Lang } from '../../i18n/i18n';
import {
  forecastFailed,
  forecastLoaded,
  locationSelected,
  retryRequested,
  selectLocation,
} from './forecastSlice';
import { toForecast } from './transform';
import type { Location } from './types';

const coordsOf = (location: Location) =>
  location.kind === 'city' ? location.city.coord : { lat: location.lat, lon: location.lon };

const nowSeconds = () => Math.floor(Date.now() / 1000);

export function* loadForecast(): SagaIterator {
  const location = (yield select(selectLocation)) as Location | null;
  if (!location) return;

  const lang = (yield select(selectLang)) as Lang;
  const controller = new AbortController();
  try {
    const result = (yield call(
      fetchForecast,
      { ...coordsOf(location), lang },
      controller.signal,
    )) as ForecastResult;
    if (!result.ok) {
      yield put(forecastFailed(result.error));
      return;
    }
    const now = (yield call(nowSeconds)) as number;
    yield put(forecastLoaded(toForecast(result.data, now)));
  } catch {
    yield put(forecastFailed('invalid-response'));
  } finally {
    if ((yield cancelled()) as boolean) controller.abort();
  }
}

const STORAGE_KEY = 'forecast.location';

const parseLocation = (value: unknown): Location | null => {
  if (!isRecord(value)) return null;
  if (value.kind === 'coords' && isNumber(value.lat) && isNumber(value.lon)) {
    return { kind: 'coords', lat: value.lat, lon: value.lon };
  }
  if (value.kind === 'city' && isCity(value.city)) return { kind: 'city', city: value.city };
  return null;
};

export const readSavedLocation = () => parseLocation(readJson(STORAGE_KEY));

function* rememberLocation(action: ReturnType<typeof locationSelected>): SagaIterator {
  yield call(writeJson, STORAGE_KEY, action.payload);
}

export function* forecastSaga(): SagaIterator {
  yield takeLatest([locationSelected.type, retryRequested.type, langChanged.type], loadForecast);
  yield takeEvery(locationSelected.type, rememberLocation);

  const saved = (yield call(readSavedLocation)) as Location | null;
  if (saved) yield put(locationSelected(saved));
}
