import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { createStore } from './app/store'
import './styles/global.scss'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found')

const store = createStore()

createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
