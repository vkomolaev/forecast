import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useT } from '../../i18n/useT'
import { locateRequested, selectLocateStatus } from './geolocationSlice'
import styles from './LocateButton.module.scss'

export const LocateButton = () => {
  const t = useT()
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectLocateStatus)
  const busy = status === 'locating'

  return (
    <>
      <button
        type="button"
        className={styles.button}
        aria-busy={busy}
        disabled={busy}
        onClick={() => dispatch(locateRequested())}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
        </svg>
        <span className={styles.label}>{busy ? t('locate.busy') : t('locate.button')}</span>
      </button>
      <p className={styles.message} role="status">
        {(status === 'denied' || status === 'unavailable') && t(`locate.${status}`)}
      </p>
    </>
  )
}
