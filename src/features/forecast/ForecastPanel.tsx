import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useT } from '../../i18n/useT';
import { ForecastList } from './ForecastList';
import {
  retryRequested,
  selectForecast,
  selectForecastError,
  selectForecastStatus,
  selectPlace,
} from './forecastSlice';
import styles from './ForecastPanel.module.scss';

export const ForecastPanel = () => {
  const t = useT();
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectForecastStatus);
  const forecast = useAppSelector(selectForecast);
  const error = useAppSelector(selectForecastError);
  const place = useAppSelector(selectPlace);

  const failure = (className: string | undefined) =>
    status === 'failed' &&
    error && (
      <div className={className} role="alert">
        <p>{t(`error.${error}`)}</p>
        {error !== 'missing-key' && (
          <button type="button" className={styles.retry} onClick={() => dispatch(retryRequested())}>
            {t('retry')}
          </button>
        )}
      </div>
    );

  if (forecast) {
    return (
      <>
        {failure(styles.banner)}
        <ForecastList forecast={forecast} place={place} busy={status === 'loading'} />
      </>
    );
  }

  if (status === 'failed' && error) return failure(styles.message);

  if (status === 'loading') {
    return (
      <div className={styles.skeleton} aria-busy="true">
        <p className={styles.loadingText} role="status">
          {t('loading')}
        </p>
        <div className={styles.skeletonHeading} />
        <div className={styles.skeletonChart} />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={styles.skeletonDay} />
        ))}
      </div>
    );
  }

  return <p className={styles.message}>{t('emptyState')}</p>;
};
