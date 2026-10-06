import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { locationSelected } from '../forecast/forecastSlice'

export type LocateError = 'denied' | 'unavailable'

interface GeolocationState {
  status: 'idle' | 'locating' | LocateError
}

const initialState: GeolocationState = { status: 'idle' }

export const geolocationSlice = createSlice({
  name: 'geolocation',
  initialState,
  reducers: {
    locateRequested: (state) => {
      state.status = 'locating'
    },
    locateFailed: (state, action: PayloadAction<LocateError>) => {
      state.status = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(locationSelected, (state) => {
      state.status = 'idle'
    })
  },
  selectors: {
    selectLocateStatus: (state) => state.status,
  },
})

export const { locateRequested, locateFailed } = geolocationSlice.actions
export const { selectLocateStatus } = geolocationSlice.selectors
