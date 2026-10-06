import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { locationSelected } from '../forecast/forecastSlice';
import type { City } from './types';

interface CitiesState {
  status: 'idle' | 'loading' | 'ready' | 'failed';
  query: string;
  suggestions: City[];
  // Lags behind `query` by the search debounce.
  suggestionsQuery: string;
}

const initialState: CitiesState = {
  status: 'idle',
  query: '',
  suggestions: [],
  suggestionsQuery: '',
};

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    citiesRequested: (state) => {
      state.status = 'loading';
    },
    searchFocused: () => undefined,
    citiesLoaded: (state) => {
      state.status = 'ready';
    },
    citiesFailed: (state) => {
      state.status = 'failed';
    },
    citiesRetryRequested: (state) => {
      state.status = 'loading';
    },
    queryChanged: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    suggestionsUpdated: (state, action: PayloadAction<{ query: string; cities: City[] }>) => {
      state.suggestions = action.payload.cities;
      state.suggestionsQuery = action.payload.query;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(locationSelected, (state, action) => {
      const location = action.payload;
      state.query = location.kind === 'city' ? `${location.city.name}, ${location.city.country}` : '';
      state.suggestions = [];
      state.suggestionsQuery = '';
    });
  },
  selectors: {
    selectCitiesStatus: (state) => state.status,
    selectQuery: (state) => state.query,
    selectSuggestions: (state) => state.suggestions,
    selectSuggestionsQuery: (state) => state.suggestionsQuery,
  },
});

export const {
  citiesRequested,
  searchFocused,
  citiesLoaded,
  citiesFailed,
  citiesRetryRequested,
  queryChanged,
  suggestionsUpdated,
} = citiesSlice.actions;
export const { selectCitiesStatus, selectQuery, selectSuggestions, selectSuggestionsQuery } = citiesSlice.selectors;
