import type { SagaIterator } from 'redux-saga';
import { call, debounce, put, race, select, take } from 'redux-saga/effects';
import { fetchCities } from '../../api/cities';
import { forecastFailed, forecastLoaded } from '../forecast/forecastSlice';
import { readSavedLocation } from '../forecast/forecastSaga';
import {
  citiesFailed,
  citiesLoaded,
  citiesRequested,
  citiesRetryRequested,
  queryChanged,
  searchFocused,
  selectQuery,
  suggestionsUpdated,
} from './citiesSlice';
import { searchCities } from './search';
import type { City } from './types';

const SEARCH_DEBOUNCE_MS = 150;

const browserRegion = () =>
  navigator.languages.map((tag) => new Intl.Locale(tag).maximize().region).find(Boolean);

function* search(cities: City[], region: string | undefined): SagaIterator {
  const query = (yield select(selectQuery)) as string;
  yield put(suggestionsUpdated({ query, cities: searchCities(cities, query, region) }));
}

function* loadCities(): SagaIterator<City[]> {
  for (;;) {
    try {
      return (yield call(fetchCities)) as City[];
    } catch {
      yield put(citiesFailed());
      yield take(citiesRetryRequested.type);
    }
  }
}

export function* citiesSaga(): SagaIterator {
  // Don't compete with the saved forecast for bandwidth, the list is 2.8 MB.
  if (yield call(readSavedLocation)) {
    yield race([take(searchFocused.type), take([forecastLoaded.type, forecastFailed.type])]);
  }
  yield put(citiesRequested());
  // 200k cities stay out of the store on purpose.
  const cities = (yield call(loadCities)) as City[];
  const region = (yield call(browserRegion)) as string | undefined;
  yield put(citiesLoaded());
  yield call(search, cities, region);
  yield debounce(SEARCH_DEBOUNCE_MS, queryChanged.type, search, cities, region);
}
