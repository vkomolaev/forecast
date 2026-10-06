import styles from './App.module.scss'
import { CitySearch } from './features/cities/CitySearch'
import { ForecastPanel } from './features/forecast/ForecastPanel'
import { useT } from './i18n/useT'

function App() {
  const t = useT()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('appTitle')}</h1>
        <CitySearch />
      </header>
      <main>
        <ForecastPanel />
      </main>
    </div>
  )
}

export default App
