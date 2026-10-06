import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useT } from '../../i18n/useT';
import styles from '../../styles/Segmented.module.scss';
import { writeJson } from '../../lib/storage';
import { selectTheme, themeChanged, THEMES, THEME_STORAGE_KEY, type Theme } from './themeSlice';

const BROWSER_BAR = { light: '#f4f6f9', dark: '#11151b' };

const ICONS: Record<Theme, ReactNode> = {
  system: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
};

export const ThemeSwitch = () => {
  const t = useT();
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (current === 'system') delete root.dataset.theme;
    else root.dataset.theme = current;

    // A manual choice overrides both system-specific theme-color tags.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light';
      meta.content = BROWSER_BAR[current === 'system' ? scheme : current];
    });
  }, [current]);

  return (
    <div className={styles.switch} role="group" aria-label={t('theme.label')}>
      {THEMES.map((theme) => (
        <button
          key={theme}
          type="button"
          className={styles.option}
          aria-pressed={theme === current}
          aria-label={t(`theme.${theme}`)}
          title={t(`theme.${theme}`)}
          onClick={() => {
            dispatch(themeChanged(theme));
            writeJson(THEME_STORAGE_KEY, theme);
          }}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
            {ICONS[theme]}
          </svg>
        </button>
      ))}
    </div>
  );
};
