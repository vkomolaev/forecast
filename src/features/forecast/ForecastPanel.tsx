import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useT } from '../../i18n/useT'
import { ForecastList } from './ForecastList'
import {
  retryRequested,
  selectForecast,
  selectForecastError,
  selectForecastStatus,
  selectPlace,
} from './forecastSlice'
import styles from './ForecastPanel.module.scss'

export const ForecastPanel = () => {
  const t = useT()
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectForecastStatus)
  const forecast = useAppSelector(selectForecast)
  const error = useAppSelector(selectForecastError)
  const place = useAppSelector(selectPlace)

  if (status === 'failed' && error) {
    return (
      <div className={styles.message} role="alert">
        <p>{t(`error.${error}`)}</p>
        {error !== 'missing-key' && (
          <button type="button" className={styles.retry} onClick={() => dispatch(retryRequested())}>
            {t('retry')}
          </button>
        )}
      </div>
    )
  }

  if (!forecast) {
    return (
      <p className={styles.message} aria-live="polite">
        {status === 'loading' ? t('loading') : t('emptyState')}
      </p>
    )
  }

  return <ForecastList forecast={forecast} place={place} busy={status === 'loading'} />
}
