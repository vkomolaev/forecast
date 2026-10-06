import { lazy, Suspense, useDeferredValue, useId } from 'react';
import { useT } from '../../i18n/useT';
import { DayCard } from './DayCard';
import styles from './ForecastList.module.scss';
import type { Forecast } from './types';

const ChartUnavailable = () => {
  const t = useT();
  return <p role="status">{t('chart.unavailable')}</p>;
};

// The table must render even if the chart chunk fails to load.
const TemperatureChart = lazy(() =>
  import('./TemperatureChart').catch(() => ({ default: ChartUnavailable })),
);

interface Props {
  forecast: Forecast;
  place: string;
  busy: boolean;
}

export const ForecastList = ({ forecast, place, busy }: Props) => {
  const t = useT();
  const headingId = useId();
  const chartForecast = useDeferredValue(forecast);
  const weekMin = Math.min(...forecast.days.map((day) => day.min));
  const weekMax = Math.max(weekMin + 1, ...forecast.days.map((day) => day.max));

  return (
    <section className={styles.section} aria-labelledby={headingId} aria-busy={busy}>
      <title>{`${place} – ${t('appTitle')}`}</title>
      <h2 id={headingId} className={styles.heading}>
        {t('forecastFor', { place })}
      </h2>
      <Suspense fallback={<div className={styles.chartPlaceholder} />}>
        <TemperatureChart forecast={chartForecast} />
      </Suspense>
      <ol className={styles.days} style={{ '--week-min': weekMin, '--week-span': weekMax - weekMin }}>
        {forecast.days.map((day, index) => (
          <li key={day.date}>
            <DayCard day={day} defaultOpen={index === 0} />
          </li>
        ))}
      </ol>
    </section>
  );
};
