import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { useT } from '../../i18n/useT'
import { formatShortDay, formatTemperature, formatTime } from '../../lib/format'
import { toChartData } from './chartData'
import styles from './TemperatureChart.module.scss'
import type { Forecast } from './types'

interface Props {
  forecast: Forecast
}

const formatDegrees = (value: number) => `${String(Math.round(value))}°`
const formatMoment = (time: unknown) => `${formatShortDay(Number(time))} ${formatTime(Number(time))}`
const formatValue = (value: unknown) => formatTemperature(Number(value))

export default function TemperatureChart({ forecast }: Props) {
  const t = useT()
  const { points, ticks, midnights, min, max, degrees } = toChartData(forecast)

  return (
    <figure className={styles.figure}>
      <figcaption className={styles.caption}>
        {t('chart.title')}
        <span className={styles.summary}>
          {t('chart.summary', { min: formatTemperature(min), max: formatTemperature(max) })}
        </span>
      </figcaption>
      <div className={styles.chart}>
        <LineChart style={{ width: '100%', height: '100%' }} data={points} responsive margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} />
          {midnights.map((time) => (
            <ReferenceLine key={time} x={time} className="midnight" />
          ))}
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={(time: number) => formatShortDay(time)}
          />
          <YAxis
            width={40}
            ticks={degrees}
            domain={[degrees[0] ?? 'auto', degrees.at(-1) ?? 'auto']}
            tickFormatter={formatDegrees}
          />
          <Tooltip labelFormatter={formatMoment} formatter={formatValue} />
          <Legend />
          <Line
            className="feels-like"
            dataKey="feelsLike"
            name={t('column.feelsLike')}
            type="monotone"
            dot={false}
            stroke="#9aa6b6"
            strokeDasharray="4 4"
          />
          <Line
            className="temp"
            dataKey="temp"
            name={t('chart.temp')}
            type="monotone"
            dot={false}
            stroke="#1f6feb"
            strokeWidth={2}
          />
        </LineChart>
      </div>
    </figure>
  )
}
