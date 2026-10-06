import { en, type MessageKey, type Messages } from './en'

export type Lang = 'en'

const dictionaries: Record<Lang, Messages> = { en }

export type Params = Readonly<Record<string, string | number>>

export const translate = (lang: Lang, key: MessageKey, params: Params = {}): string =>
  dictionaries[lang][key].replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
