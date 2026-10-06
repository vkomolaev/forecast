import type { SagaIterator } from 'redux-saga'
import { all, fork } from 'redux-saga/effects'
import { citiesSaga } from '../features/cities/citiesSaga'
import { forecastSaga } from '../features/forecast/forecastSaga'

export function* rootSaga(): SagaIterator {
  yield all([fork(forecastSaga), fork(citiesSaga)])
}
