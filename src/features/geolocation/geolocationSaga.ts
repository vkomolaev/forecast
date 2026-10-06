import type { SagaIterator } from 'redux-saga';
import { call, put, race, take, takeLatest } from 'redux-saga/effects';
import { locationSelected } from '../forecast/forecastSlice';
import { locateFailed, locateRequested, type LocateError } from './geolocationSlice';

const TEN_MINUTES = 10 * 60 * 1000;

const getPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15_000, maximumAge: TEN_MINUTES });
  });

const PERMISSION_DENIED = 1;

const toLocateError = (error: unknown): LocateError =>
  (error as Partial<GeolocationPositionError> | null)?.code === PERMISSION_DENIED ? 'denied' : 'unavailable';

function* locate(): SagaIterator {
  try {
    const { position } = (yield race({
      position: call(getPosition),
      picked: take(locationSelected.type),
    })) as { position?: GeolocationPosition };
    if (!position) return;
    const { coords } = position;
    yield put(locationSelected({ kind: 'coords', lat: coords.latitude, lon: coords.longitude }));
  } catch (error) {
    yield put(locateFailed(toLocateError(error)));
  }
}

export function* geolocationSaga(): SagaIterator {
  yield takeLatest(locateRequested.type, locate);
}
