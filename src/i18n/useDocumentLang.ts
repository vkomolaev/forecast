import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectLang } from './i18nSlice';

export const useDocumentLang = () => {
  const lang = useAppSelector(selectLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
};
