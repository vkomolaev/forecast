import { useAppSelector } from '../app/hooks'
import type { MessageKey } from './en'
import { translate, type Params } from './i18n'
import { selectLang } from './i18nSlice'

export const useT = () => {
  const lang = useAppSelector(selectLang)
  return (key: MessageKey, params?: Params) => translate(lang, key, params)
}
