import { call, put } from 'redux-saga/effects'
import { describe, expect, it } from 'vitest'
import { locationSelected } from '../forecast/forecastSlice'
import { getPosition, locate, toLocateError } from './geolocationSaga'
import { locateFailed } from './geolocationSlice'

const position = { coords: { latitude: 50.08, longitude: 14.43 } } as GeolocationPosition

describe('locate', () => {
  it('selects the current position', () => {
    const saga = locate()
    expect(saga.next().value).toEqual(call(getPosition))
    expect(saga.next(position).value).toEqual(put(locationSelected({ kind: 'coords', lat: 50.08, lon: 14.43 })))
    expect(saga.next().done).toBe(true)
  })

  it('reports a refused permission', () => {
    const saga = locate()
    saga.next()
    expect(saga.throw({ code: 1 }).value).toEqual(put(locateFailed('denied')))
  })
})

describe('toLocateError', () => {
  it('treats anything but a refusal as unavailable', () => {
    expect(toLocateError({ code: 3 })).toBe('unavailable')
    expect(toLocateError(new Error('Geolocation is not supported'))).toBe('unavailable')
    expect(toLocateError(null)).toBe('unavailable')
  })
})
