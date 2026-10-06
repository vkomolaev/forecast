import type { SagaIterator } from 'redux-saga'
import { all, fork } from 'redux-saga/effects'
import { citiesSaga } from '../features/cities/citiesSaga'
import { forecastSaga } from '../features/forecast/forecastSaga'
import { geolocationSaga } from '../features/geolocation/geolocationSaga'
import { themeSaga } from '../features/theme/themeSaga'
import { i18nSaga } from '../i18n/i18nSaga'

export function* rootSaga(): SagaIterator {
  yield all([fork(forecastSaga), fork(citiesSaga), fork(geolocationSaga), fork(themeSaga), fork(i18nSaga)])
}
