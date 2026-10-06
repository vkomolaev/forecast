import type { SagaIterator } from 'redux-saga'
import { call, select, takeEvery } from 'redux-saga/effects'
import { writeJson } from '../../lib/storage'
import { selectTheme, themeChanged, type Theme } from './themeSlice'

// Keep in sync with the inline script in index.html.
export const THEME_STORAGE_KEY = 'forecast.theme'

const BROWSER_BAR = { light: '#f4f6f9', dark: '#11151b' }

const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme

  // Each meta targets one system scheme; a manual choice overrides both.
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const scheme = meta.media.includes('dark') ? 'dark' : 'light'
    meta.content = BROWSER_BAR[theme === 'system' ? scheme : theme]
  })
}

function* changeTheme(action: ReturnType<typeof themeChanged>): SagaIterator {
  yield call(applyTheme, action.payload)
  yield call(writeJson, THEME_STORAGE_KEY, action.payload)
}

export function* themeSaga(): SagaIterator {
  yield call(applyTheme, (yield select(selectTheme)) as Theme)
  yield takeEvery(themeChanged.type, changeTheme)
}
