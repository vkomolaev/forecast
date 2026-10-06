import { cs } from './cs';
import { en, type MessageKey, type Messages } from './en';

export const LANGS = ['en', 'cs'] as const;
export type Lang = (typeof LANGS)[number];

const dictionaries: Record<Lang, Messages> = { en, cs };

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

export const detectLang = (languages: readonly string[]): Lang =>
  languages.map((tag) => new Intl.Locale(tag).language).find(isLang) ?? 'en';

export type Params = Readonly<Record<string, string | number>>;

export const translate = (lang: Lang, key: MessageKey, params: Params = {}): string =>
  dictionaries[lang][key].replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
