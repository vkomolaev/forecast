import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

export const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)

interface ThemeState {
  theme: Theme
}

const initialState: ThemeState = { theme: 'system' }

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themeChanged: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },
  },
  selectors: {
    selectTheme: (state) => state.theme,
  },
})

export const { themeChanged } = themeSlice.actions
export const { selectTheme } = themeSlice.selectors
