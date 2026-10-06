import { describe, expect, it } from 'vitest'
import { formatCountry, formatDay, formatPercent, formatSpeed, formatTemperature, formatTime } from './format'

// Tue 6 Oct 2026, 14:00 in the city's local time.
const time = Date.UTC(2026, 9, 6, 14) / 1000
const en = ['en-US']
const cs = ['cs-CZ']

// ICU versions differ in which space they put between a number and its unit.
const spaces = (value: string) => value.replace(/\s/g, ' ')

describe('format', () => {
  it('formats the day in the given locale', () => {
    expect(formatDay(time, en)).toBe('Tuesday, October 6')
    expect(spaces(formatDay(time, cs))).toBe('úterý 6. října')
  })

  it('formats time as already shifted local time', () => {
    expect(spaces(formatTime(time, en))).toBe('2:00 PM')
    expect(formatTime(time, cs)).toBe('14:00')
  })

  it('formats numbers with locale units', () => {
    expect(formatTemperature(19.6, en)).toBe('20°C')
    expect(spaces(formatTemperature(-3, cs))).toBe('-3 °C')
    expect(formatPercent(0.35, en)).toBe('35%')
    expect(spaces(formatSpeed(3.24, cs))).toBe('3,2 m/s')
  })

  it('does not show negative zero', () => {
    expect(spaces(formatTemperature(-0.4, cs))).toBe('0 °C')
  })

  it('names countries in the given language', () => {
    expect(formatCountry('CZ', ['cs'])).toBe('Česko')
    expect(formatCountry('HR', ['en'])).toBe('Croatia')
  })
})
