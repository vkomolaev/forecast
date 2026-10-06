import { describe, expect, it } from 'vitest'
import { detectLang, translate } from './i18n'

describe('detectLang', () => {
  it('takes the first supported language', () => {
    expect(detectLang(['de-DE', 'cs-CZ', 'en-US'])).toBe('cs')
    expect(detectLang(['en-GB', 'cs'])).toBe('en')
  })

  it('falls back to English', () => {
    expect(detectLang(['de-DE', 'uk'])).toBe('en')
    expect(detectLang([])).toBe('en')
  })
})

describe('translate', () => {
  it('fills in parameters', () => {
    expect(translate('en', 'forecastFor', { place: 'Brno, CZ' })).toBe('Forecast for Brno, CZ')
    expect(translate('cs', 'forecastFor', { place: 'Brno, CZ' })).toBe('Předpověď pro Brno, CZ')
  })

  it('leaves unknown placeholders as they are', () => {
    expect(translate('en', 'forecastFor')).toBe('Forecast for {place}')
  })
})
