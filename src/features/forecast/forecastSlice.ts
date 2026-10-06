import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ForecastError } from '../../api/openWeather'
import type { Forecast, Location } from './types'

interface ForecastState {
  location: Location | null
  status: 'idle' | 'loading' | 'ready' | 'failed'
  data: Forecast | null
  error: ForecastError | null
}

const initialState: ForecastState = {
  location: null,
  status: 'idle',
  data: null,
  error: null,
}

export const forecastSlice = createSlice({
  name: 'forecast',
  initialState,
  reducers: {
    locationSelected: (state, action: PayloadAction<Location>) => {
      state.location = action.payload
      state.status = 'loading'
      state.error = null
    },
    retryRequested: (state) => {
      state.status = 'loading'
      state.error = null
    },
    forecastLoaded: (state, action: PayloadAction<Forecast>) => {
      state.status = 'ready'
      state.data = action.payload
    },
    forecastFailed: (state, action: PayloadAction<ForecastError>) => {
      state.status = 'failed'
      state.error = action.payload
    },
  },
  selectors: {
    selectLocation: (state) => state.location,
    selectForecast: (state) => state.data,
    selectForecastStatus: (state) => state.status,
    selectForecastError: (state) => state.error,
  },
})

export const { locationSelected, retryRequested, forecastLoaded, forecastFailed } = forecastSlice.actions
export const { selectLocation, selectForecast, selectForecastStatus, selectForecastError } =
  forecastSlice.selectors

// OWM names coordinates by the nearest district, so a picked city keeps its own name.
export const selectPlace = createSelector([selectLocation, selectForecast], (location, forecast) => {
  if (location?.kind === 'city') return `${location.city.name}, ${location.city.country}`
  return forecast ? `${forecast.cityName}, ${forecast.country}` : ''
})
