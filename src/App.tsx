import styles from './App.module.scss';
import { CitySearch } from './features/cities/CitySearch';
import { ForecastPanel } from './features/forecast/ForecastPanel';
import { LocateButton } from './features/geolocation/LocateButton';
import { ThemeSwitch } from './features/theme/ThemeSwitch';
import { useDocumentTheme } from './features/theme/useDocumentTheme';
import { LangSwitch } from './i18n/LangSwitch';
import { useDocumentLang } from './i18n/useDocumentLang';
import { useT } from './i18n/useT';

function App() {
  const t = useT();
  useDocumentTheme();
  useDocumentLang();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.top}>
          <h1 className={styles.title}>{t('appTitle')}</h1>
          <div className={styles.settings}>
            <ThemeSwitch />
            <LangSwitch />
          </div>
        </div>
        <div className={styles.controls}>
          <CitySearch />
          <LocateButton />
        </div>
      </header>
      <main>
        <ForecastPanel />
      </main>
    </div>
  );
}

export default App;
