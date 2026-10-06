import { writeJson } from '../lib/storage';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { LANGS } from './i18n';
import { langChanged, selectLang, LANG_STORAGE_KEY } from './i18nSlice';
import styles from '../styles/Segmented.module.scss';
import { useT } from './useT';

export const LangSwitch = () => {
  const t = useT();
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectLang);

  return (
    <div className={styles.switch} role="group" aria-label={t('lang.label')}>
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          className={styles.option}
          aria-pressed={lang === current}
          onClick={() => {
            if (lang === current) return;
            dispatch(langChanged(lang));
            writeJson(LANG_STORAGE_KEY, lang);
          }}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
