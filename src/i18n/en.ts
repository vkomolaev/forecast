export const en = {
  appTitle: 'Forecast',
  'search.label': 'City',
  'search.placeholder': 'Search for a city…',
  'search.loading': 'Loading the city list…',
  'search.failed': 'Could not load the city list.',
  'search.empty': 'No cities found',
  forecastFor: 'Forecast for {place}',
  today: 'Today',
  emptyState: 'Pick a city to see its 5-day forecast.',
  loading: 'Loading forecast…',
  retry: 'Try again',
  'error.missing-key': 'The OpenWeatherMap API key is not configured.',
  'error.invalid-key': 'The OpenWeatherMap API key is invalid.',
  'error.not-found': 'There is no forecast for this place.',
  'error.rate-limit': 'Too many requests. Please try again in a minute.',
  'error.network': 'Could not load the forecast.',
  'column.time': 'Time',
  'column.weather': 'Weather',
  'column.temp': 'Temp',
  'column.feelsLike': 'Feels like',
  'column.wind': 'Wind',
  'column.humidity': 'Humidity',
  'column.pop': 'Precip.',
  dayRange: 'High {max}, low {min}',
}

export type MessageKey = keyof typeof en
export type Messages = Readonly<Record<MessageKey, string>>
