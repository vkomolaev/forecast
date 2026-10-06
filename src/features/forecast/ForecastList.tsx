import { useId } from 'react'
import { useT } from '../../i18n/useT'
import { DayCard } from './DayCard'
import styles from './ForecastList.module.scss'
import type { Forecast } from './types'

interface Props {
  forecast: Forecast
  place: string
  busy: boolean
}

export const ForecastList = ({ forecast, place, busy }: Props) => {
  const t = useT()
  const headingId = useId()

  return (
    <section className={styles.section} aria-labelledby={headingId} aria-busy={busy}>
      <title>{`${place} – ${t('appTitle')}`}</title>
      <h2 id={headingId} className={styles.heading}>
        {t('forecastFor', { place })}
      </h2>
      <ol className={styles.days}>
        {forecast.days.map((day, index) => (
          <li key={day.date}>
            <DayCard day={day} defaultOpen={index === 0} />
          </li>
        ))}
      </ol>
    </section>
  )
}
