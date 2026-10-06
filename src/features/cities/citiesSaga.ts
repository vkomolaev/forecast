import type { SagaIterator } from 'redux-saga'
import { call, debounce, put, select, take } from 'redux-saga/effects'
import { fetchCities } from '../../api/cities'
import {
  citiesFailed,
  citiesLoaded,
  citiesRetryRequested,
  queryChanged,
  selectQuery,
  suggestionsUpdated,
} from './citiesSlice'
import { createIndex, searchCities, type CityIndex } from './search'
import type { City } from './types'

const SEARCH_DEBOUNCE_MS = 150

const browserRegion = () =>
  navigator.languages.map((tag) => new Intl.Locale(tag).maximize().region).find(Boolean)

function* search(index: CityIndex, region: string | undefined): SagaIterator {
  const query = (yield select(selectQuery)) as string
  yield put(suggestionsUpdated({ query, cities: searchCities(index, query, region) }))
}

function* loadIndex(): SagaIterator<CityIndex> {
  for (;;) {
    try {
      const cities = (yield call(fetchCities)) as City[]
      return createIndex(cities)
    } catch {
      yield put(citiesFailed())
      yield take(citiesRetryRequested.type)
    }
  }
}

export function* citiesSaga(): SagaIterator {
  // The city list lives here rather than in the store: 200k records would only slow Redux down.
  const index = (yield call(loadIndex)) as CityIndex
  const region = (yield call(browserRegion)) as string | undefined
  yield put(citiesLoaded())
  yield call(search, index, region)
  yield debounce(SEARCH_DEBOUNCE_MS, queryChanged.type, search, index, region)
}
