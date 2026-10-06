import type { OwmForecastItem, OwmForecastResponse } from '../../api/types'
import type { Day, Forecast, Slot } from './types'

const DAYS = 5
const SECONDS_PER_DAY = 86_400
const NOON = 12 * 3600

const dayKey = (time: number) => Math.floor(time / SECONDS_PER_DAY)

const toSlot =
  (timezone: number) =>
  (item: OwmForecastItem): Slot => ({
    time: item.dt + timezone,
    temp: item.main.temp,
    feelsLike: item.main.feels_like,
    icon: item.weather[0]?.icon ?? '',
    description: item.weather[0]?.description ?? '',
    windSpeed: item.wind.speed,
    humidity: item.main.humidity,
    pop: item.pop,
  })

const distanceFromNoon = (slot: Slot) => Math.abs((slot.time % SECONDS_PER_DAY) - NOON)

const closestToNoon = (slots: Slot[]): Slot =>
  slots.reduce((best, slot) => (distanceFromNoon(slot) < distanceFromNoon(best) ? slot : best))

const toDay = (slots: [Slot, ...Slot[]], todayKey: number): Day => {
  const temps = slots.map((slot) => slot.temp)
  const representative = closestToNoon(slots)
  return {
    date: slots[0].time,
    isToday: dayKey(slots[0].time) === todayKey,
    min: Math.min(...temps),
    max: Math.max(...temps),
    icon: representative.icon,
    description: representative.description,
    slots,
  }
}

const groupByDay = (slots: Slot[]): [Slot, ...Slot[]][] =>
  Object.values(Object.groupBy(slots, (slot) => dayKey(slot.time))).filter(
    (group): group is [Slot, ...Slot[]] => group !== undefined && group.length > 0,
  )

export const toForecast = (response: OwmForecastResponse, nowSeconds: number): Forecast => {
  const { timezone } = response.city
  const slots = response.list.map(toSlot(timezone)).toSorted((a, b) => a.time - b.time)
  const todayKey = dayKey(nowSeconds + timezone)

  return {
    cityName: response.city.name,
    country: response.city.country,
    days: groupByDay(slots)
      .slice(0, DAYS)
      .map((group) => toDay(group, todayKey)),
  }
}
