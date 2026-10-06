import { formatDay, formatPercent, formatSpeed, formatTemperature, formatTime } from '../../lib/format'
import { useT } from '../../i18n/useT'
import styles from './DayCard.module.scss'
import type { Day } from './types'

interface Props {
  day: Day
  defaultOpen: boolean
}

const WeatherIcon = ({ icon, description, size }: { icon: string; description: string; size: number }) => (
  <img
    className={styles.icon}
    src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
    alt={description}
    width={size}
    height={size}
    loading="lazy"
  />
)

export const DayCard = ({ day, defaultOpen }: Props) => {
  const t = useT()
  const max = formatTemperature(day.max)
  const min = formatTemperature(day.min)

  return (
    <details className={styles.card} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.date}>
          {day.isToday && <span className={styles.today}>{t('today')}</span>}
          {formatDay(day.date)}
        </span>
        <WeatherIcon icon={day.icon} description={day.description} size={48} />
        <span className={styles.range} aria-label={t('dayRange', { max, min })}>
          <span className={styles.max}>{max}</span>
          <span className={styles.min}>{min}</span>
        </span>
      </summary>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t('column.time')}</th>
              <th scope="col">{t('column.weather')}</th>
              <th scope="col">{t('column.temp')}</th>
              <th scope="col" className={styles.optional}>
                {t('column.feelsLike')}
              </th>
              <th scope="col">{t('column.wind')}</th>
              <th scope="col" className={styles.optional}>
                {t('column.humidity')}
              </th>
              <th scope="col">{t('column.pop')}</th>
            </tr>
          </thead>
          <tbody>
            {day.slots.map((slot) => (
              <tr key={slot.time}>
                <th scope="row">{formatTime(slot.time)}</th>
                <td>
                  <span className={styles.weather}>
                    <WeatherIcon icon={slot.icon} description="" size={32} />
                    <span className={styles.description}>{slot.description}</span>
                  </span>
                </td>
                <td className={styles.temp}>{formatTemperature(slot.temp)}</td>
                <td className={styles.optional}>{formatTemperature(slot.feelsLike)}</td>
                <td>{formatSpeed(slot.windSpeed)}</td>
                <td className={styles.optional}>{formatPercent(slot.humidity / 100)}</td>
                <td>{formatPercent(slot.pop)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
