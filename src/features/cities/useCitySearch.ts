import { useState, type KeyboardEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
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
import { normalize } from './search';
import type { City } from './types';

export const useCitySearch = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectCitiesStatus);
  const query = useAppSelector(selectQuery);
  const suggestions = useAppSelector(selectSuggestions);
  const suggestionsQuery = useAppSelector(selectSuggestionsQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

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

  const onChange = (value: string) => {
    dispatch(queryChanged(value));
    setOpen(true);
    setActive(-1);
  };

  const onFocus = () => {
    dispatch(searchFocused());
    setOpen(true);
  };

  return {
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
    close: () => {
      setOpen(false);
    },
    retry: () => dispatch(citiesRetryRequested()),
  };
};
