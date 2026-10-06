import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectTheme } from './themeSlice';

export const useDocumentTheme = () => {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
};
