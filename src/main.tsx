import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { createStore } from './app/store'
import { THEME_STORAGE_KEY } from './features/theme/themeSaga'
import { isTheme } from './features/theme/themeSlice'
import { detectLang, isLang } from './i18n/i18n'
import { LANG_STORAGE_KEY } from './i18n/i18nSaga'
import { readJson } from './lib/storage'
import './styles/global.scss'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

const savedLang = readJson(LANG_STORAGE_KEY)
const savedTheme = readJson(THEME_STORAGE_KEY)
const store = createStore({
  i18n: { lang: isLang(savedLang) ? savedLang : detectLang(navigator.languages) },
  theme: { theme: isTheme(savedTheme) ? savedTheme : 'system' },
})

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
