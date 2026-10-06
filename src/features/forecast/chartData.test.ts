import { describe, expect, it } from 'vitest'
import type { OwmForecastResponse } from '../../api/types'
import prague from './__fixtures__/prague.json'
import { toChartData } from './chartData'
import { toForecast } from './transform'

const response = prague as OwmForecastResponse
const forecast = toForecast(response, response.list[0]?.dt ?? 0)
const chart = toChartData(forecast)

describe('toChartData', () => {
  it('keeps every slot of the shown days in order', () => {
    const slots = forecast.days.flatMap((day) => day.slots)
    expect(chart.points).toHaveLength(slots.length)
    expect(chart.points.map((point) => point.time)).toEqual(slots.map((slot) => slot.time))
  })

  it('marks local midnights between the days', () => {
    expect(chart.midnights).toHaveLength(forecast.days.length - 1)
    expect(chart.midnights.every((time) => time % 86_400 === 0)).toBe(true)
  })

  it('spans both temperature and feels like', () => {
    const values = chart.points.flatMap((point) => [point.temp, point.feelsLike])
    expect(chart.min).toBe(Math.min(...values))
    expect(chart.max).toBe(Math.max(...values))
  })

  it('puts temperature ticks on round numbers around the data', () => {
    const { degrees, min, max } = chart
    expect(degrees.every((value) => value % 5 === 0)).toBe(true)
    expect(degrees[0]).toBeLessThanOrEqual(min)
    expect(degrees.at(-1)).toBeGreaterThanOrEqual(max)
  })

  it('handles frost and wide ranges', () => {
    const days = forecast.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({ ...slot, temp: slot.temp - 40 })),
    }))
    const frosty = toChartData({ ...forecast, days })
    expect(frosty.degrees[0]).toBeLessThanOrEqual(frosty.min)
    expect(frosty.degrees.every((value) => value % 10 === 0)).toBe(true)
  })
})
