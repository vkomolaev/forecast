import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectTheme } from './themeSlice';

const BROWSER_BAR = { light: '#f4f6f9', dark: '#11151b' };

export const useDocumentTheme = () => {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;

    // A manual choice overrides both system-specific theme-color tags.
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      const scheme = meta.media.includes('dark') ? 'dark' : 'light';
      meta.content = BROWSER_BAR[theme === 'system' ? scheme : theme];
    });
  }, [theme]);
};
