import { combineSlices, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { citiesSlice } from '../features/cities/citiesSlice'
import { forecastSlice } from '../features/forecast/forecastSlice'
import { i18nSlice } from '../i18n/i18nSlice'
import { rootSaga } from './rootSaga'

const rootReducer = combineSlices(forecastSlice, citiesSlice, i18nSlice)

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  })
  sagaMiddleware.run(rootSaga)
  return store
}

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']
