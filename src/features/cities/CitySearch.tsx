import { useId, useState, type KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useT } from '../../i18n/useT';
import { selectLang } from '../../i18n/i18nSlice';
import { formatCoordinate, formatCountry } from '../../lib/format';
import { locationSelected } from '../forecast/forecastSlice';
import {
  citiesRetryRequested,
  queryChanged,
  searchFocused,
  selectCitiesStatus,
  selectQuery,
  selectSuggestions,
  selectSuggestionsQuery,
} from './citiesSlice';
import styles from './CitySearch.module.scss';
import { normalize } from './search';
import type { City } from './types';

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
  const dispatch = useAppDispatch();
  const id = useId();
  const status = useAppSelector(selectCitiesStatus);
  const query = useAppSelector(selectQuery);
  const suggestions = useAppSelector(selectSuggestions);
  const suggestionsQuery = useAppSelector(selectSuggestionsQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${String(index)}`;
  const settled = status === 'ready' && suggestionsQuery === query;
  const showEmpty = settled && suggestions.length === 0 && normalize(query).length >= 2;
  const expanded = open && (suggestions.length > 0 || showEmpty);

  const select = (city: City) => {
    dispatch(locationSelected({ kind: 'city', city }));
    setOpen(false);
    setActive(-1);
  };

  const move = (step: 1 | -1) => {
    const count = suggestions.length;
    setOpen(true);
    if (count === 0) return;
    if (active === -1) setActive(step === 1 ? 0 : count - 1);
    else setActive((active + step + count) % count);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        break;
      case 'Enter': {
        const city = suggestions[active];
        if (expanded && city) {
          event.preventDefault();
          select(city);
        }
        break;
      }
      case 'Escape':
        if (expanded) setOpen(false);
        else dispatch(queryChanged(''));
        setActive(-1);
        break;
    }
  };

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
          dispatch(queryChanged(event.target.value));
          setOpen(true);
          setActive(-1);
        }}
        onFocus={(event) => {
          event.target.select();
          dispatch(searchFocused());
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
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
            <button type="button" className={styles.retry} onClick={() => dispatch(citiesRetryRequested())}>
              {t('retry')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
