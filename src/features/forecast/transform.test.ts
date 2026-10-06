import { describe, expect, it } from 'vitest'
import type { OwmForecastResponse } from '../../api/types'
import prague from './__fixtures__/prague.json'
import { toForecast } from './transform'

const response = prague as OwmForecastResponse
const firstDt = response.list[0]?.dt ?? 0

const withTimezone = (timezone: number): OwmForecastResponse => ({
  ...response,
  city: { ...response.city, timezone },
})

describe('toForecast', () => {
  const forecast = toForecast(response, firstDt)

  it('takes city name and country from the response', () => {
    expect(forecast.cityName).toBe('Prague')
    expect(forecast.country).toBe('CZ')
  })

  it('returns five days, the first one being today', () => {
    expect(forecast.days).toHaveLength(5)
    expect(forecast.days.map((day) => day.isToday)).toEqual([true, false, false, false, false])
  })

  it('shifts times into the city timezone', () => {
    expect(forecast.days[0]?.slots[0]?.time).toBe(firstDt + 7200)
  })

  it('keeps every slot of a day on the same local date', () => {
    forecast.days.forEach((day) => {
      const dates = new Set(day.slots.map((slot) => Math.floor(slot.time / 86_400)))
      expect(dates.size).toBe(1)
    })
  })

  it('computes min and max of the day', () => {
    forecast.days.forEach((day) => {
      const temps = day.slots.map((slot) => slot.temp)
      expect(day.min).toBe(Math.min(...temps))
      expect(day.max).toBe(Math.max(...temps))
    })
  })

  it('uses the slot closest to noon for the day icon', () => {
    const day = forecast.days[1]
    const hours = day?.slots.map((slot) => (slot.time % 86_400) / 3600)
    expect(hours).toContain(11)
    expect(day?.icon).toBe(day?.slots[hours?.indexOf(11) ?? -1]?.icon)
  })

  it('groups by the city local date, not UTC', () => {
    const tokyo = toForecast(withTimezone(9 * 3600), firstDt)
    tokyo.days.forEach((day) => {
      expect(new Set(day.slots.map((slot) => Math.floor(slot.time / 86_400))).size).toBe(1)
    })
    expect(tokyo.days[0]?.slots[0]?.time).toBe(firstDt + 9 * 3600)
  })
})
