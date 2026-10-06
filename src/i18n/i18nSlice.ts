import { createSlice } from '@reduxjs/toolkit'
import type { Lang } from './i18n'

interface I18nState {
  lang: Lang
}

const initialState: I18nState = { lang: 'en' }

export const i18nSlice = createSlice({
  name: 'i18n',
  initialState,
  reducers: {},
  selectors: {
    selectLang: (state) => state.lang,
  },
})

export const { selectLang } = i18nSlice.selectors
