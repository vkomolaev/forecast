import type { SagaIterator } from 'redux-saga'
import { call, select, takeEvery } from 'redux-saga/effects'
import { writeJson } from '../lib/storage'
import type { Lang } from './i18n'
import { langChanged, selectLang } from './i18nSlice'

export const LANG_STORAGE_KEY = 'forecast.lang'

const setDocumentLang = (lang: Lang) => {
  document.documentElement.lang = lang
}

function* applyLang(action: ReturnType<typeof langChanged>): SagaIterator {
  yield call(setDocumentLang, action.payload)
  yield call(writeJson, LANG_STORAGE_KEY, action.payload)
}

export function* i18nSaga(): SagaIterator {
  yield call(setDocumentLang, (yield select(selectLang)) as Lang)
  yield takeEvery(langChanged.type, applyLang)
}
