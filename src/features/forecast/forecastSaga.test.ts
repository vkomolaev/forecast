import { call, cancelled, put, select } from 'redux-saga/effects'
import { describe, expect, it } from 'vitest'
import { fetchForecast } from '../../api/openWeather'
import type { OwmForecastResponse } from '../../api/types'
import { selectLang } from '../../i18n/i18nSlice'
import prague from './__fixtures__/prague.json'
import { loadForecast, parseLocation } from './forecastSaga'
import { forecastFailed, forecastLoaded, selectLocation } from './forecastSlice'
import { toForecast } from './transform'
import type { Location } from './types'

const location: Location = { kind: 'coords', lat: 50.09, lon: 14.42 }

const startLoading = () => {
  const saga = loadForecast()
  expect(saga.next().value).toEqual(select(selectLocation))
  expect(saga.next(location).value).toEqual(select(selectLang))
  const request = saga.next('en').value as ReturnType<typeof call>
  expect(request.payload.fn).toBe(fetchForecast)
  expect(request.payload.args[0]).toEqual({ lat: 50.09, lon: 14.42, lang: 'en' })
  return saga
}

describe('loadForecast', () => {
  it('puts the transformed forecast on success', () => {
    const saga = startLoading()
    const data = prague as OwmForecastResponse
    saga.next({ ok: true, data })
    expect(saga.next(1_000).value).toEqual(put(forecastLoaded(toForecast(data, 1_000))))
    expect(saga.next().value).toEqual(cancelled())
    expect(saga.next(false).done).toBe(true)
  })

  it('puts the error when the request fails', () => {
    const saga = startLoading()
    expect(saga.next({ ok: false, error: 'invalid-key' }).value).toEqual(put(forecastFailed('invalid-key')))
  })

  it('aborts the request when cancelled by a newer location', () => {
    const saga = loadForecast()
    saga.next()
    saga.next(location)
    const request = saga.next('en').value as ReturnType<typeof call>
    const signal = request.payload.args[1] as AbortSignal

    expect(saga.return(undefined).value).toEqual(cancelled())
    saga.next(true)
    expect(signal.aborted).toBe(true)
  })

  it('does nothing without a location', () => {
    const saga = loadForecast()
    saga.next()
    expect(saga.next(null).done).toBe(true)
  })
})

describe('parseLocation', () => {
  const city = { id: 1, name: 'Prague', country: 'CZ', coord: { lat: 50.09, lon: 14.42 } }

  it('accepts stored cities and coordinates', () => {
    expect(parseLocation({ kind: 'city', city })).toEqual({ kind: 'city', city })
    expect(parseLocation({ kind: 'coords', lat: 1, lon: 2 })).toEqual({ kind: 'coords', lat: 1, lon: 2 })
  })

  it('drops extra fields', () => {
    expect(parseLocation({ kind: 'coords', lat: 1, lon: 2, extra: true })).toEqual({ kind: 'coords', lat: 1, lon: 2 })
  })

  it('rejects anything else', () => {
    expect(parseLocation(null)).toBeNull()
    expect(parseLocation('Prague')).toBeNull()
    expect(parseLocation({ kind: 'coords', lat: '1', lon: 2 })).toBeNull()
    expect(parseLocation({ kind: 'city', city: { ...city, coord: null } })).toBeNull()
  })
})
