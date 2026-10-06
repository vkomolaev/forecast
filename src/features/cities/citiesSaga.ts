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
import { createIndex, searchCities, type CityIndex } from './search';
import type { City } from './types';

const SEARCH_DEBOUNCE_MS = 150;

const browserRegion = () =>
  navigator.languages.map((tag) => new Intl.Locale(tag).maximize().region).find(Boolean);

function* search(index: CityIndex, region: string | undefined): SagaIterator {
  const query = (yield select(selectQuery)) as string;
  yield put(suggestionsUpdated({ query, cities: searchCities(index, query, region) }));
}

function* loadIndex(): SagaIterator<CityIndex> {
  for (;;) {
    try {
      const cities = (yield call(fetchCities)) as City[];
      return createIndex(cities);
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
  const index = (yield call(loadIndex)) as CityIndex;
  const region = (yield call(browserRegion)) as string | undefined;
  yield put(citiesLoaded());
  yield call(search, index, region);
  yield debounce(SEARCH_DEBOUNCE_MS, queryChanged.type, search, index, region);
}
