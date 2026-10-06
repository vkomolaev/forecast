import { combineSlices, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { citiesSlice } from '../features/cities/citiesSlice';
import { forecastSlice } from '../features/forecast/forecastSlice';
import { geolocationSlice } from '../features/geolocation/geolocationSlice';
import { isTheme, themeSlice, THEME_STORAGE_KEY } from '../features/theme/themeSlice';
import { detectLang, isLang } from '../i18n/i18n';
import { i18nSlice, LANG_STORAGE_KEY } from '../i18n/i18nSlice';
import { readJson } from '../lib/storage';
import { rootSaga } from './rootSaga';

const rootReducer = combineSlices(forecastSlice, citiesSlice, geolocationSlice, themeSlice, i18nSlice);

const savedLang = readJson(LANG_STORAGE_KEY);
const savedTheme = readJson(THEME_STORAGE_KEY);
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: {
    i18n: { lang: isLang(savedLang) ? savedLang : detectLang(navigator.languages) },
    theme: { theme: isTheme(savedTheme) ? savedTheme : 'system' },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
