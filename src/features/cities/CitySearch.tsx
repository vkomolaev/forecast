import { useId } from 'react';
import { useAppSelector } from '../../app/hooks';
import { useT } from '../../i18n/useT';
import { selectLang } from '../../i18n/i18nSlice';
import { formatCoordinate, formatCountry } from '../../lib/format';
import styles from './CitySearch.module.scss';
import { normalize } from './search';
import { useCitySearch } from './useCitySearch';

const Highlighted = ({ name, query }: { name: string; query: string }) => {
  const length = normalize(query).length;
  return (
    <>
      <mark className={styles.mark}>{name.slice(0, length)}</mark>
      {name.slice(length)}
    </>
  );
};

export const CitySearch = () => {
  const t = useT();
  const lang = useAppSelector(selectLang);
  const id = useId();
  const {
    status,
    query,
    suggestions,
    suggestionsQuery,
    active,
    setActive,
    expanded,
    showEmpty,
    select,
    onKeyDown,
    onChange,
    onFocus,
    close,
    retry,
  } = useCitySearch();

  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${String(index)}`;

  return (
    <div className={styles.search}>
      <label htmlFor={`${id}-input`} className={styles.label}>
        {t('search.label')}
      </label>
      <input
        id={`${id}-input`}
        className={styles.input}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
        aria-describedby={`${id}-status`}
        autoComplete="off"
        spellCheck={false}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onFocus={(event) => {
          event.target.select();
          onFocus();
        }}
        onBlur={close}
        onKeyDown={onKeyDown}
      />

      <ul id={listId} role="listbox" aria-label={t('search.label')} className={styles.list} hidden={!expanded}>
        {suggestions.map((city, index) => (
          <li
            key={city.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            className={styles.option}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              select(city);
            }}
            onMouseMove={() => {
              setActive(index);
            }}
          >
            <span className={styles.name}>
              <Highlighted name={city.name} query={suggestionsQuery} />
            </span>
            <span className={styles.meta}>
              {formatCountry(city.country, [lang])} · {formatCoordinate(city.coord.lat)}°, {formatCoordinate(city.coord.lon)}°
            </span>
          </li>
        ))}
        {showEmpty && (
          <li className={styles.empty} role="option" aria-disabled="true" aria-selected="false">
            {t('search.empty')}
          </li>
        )}
      </ul>

      <div id={`${id}-status`} className={styles.status} aria-live="polite">
        {status === 'loading' && <span className={styles.loading}>{t('search.loading')}</span>}
        {status === 'failed' && (
          <>
            {t('search.failed')}{' '}
            <button type="button" className={styles.retry} onClick={retry}>
              {t('retry')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
