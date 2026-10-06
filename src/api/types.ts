export interface OwmForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: { id: number; main: string; description: string; icon: string }[];
  wind: { speed: number };
  pop: number;
}

export interface OwmForecastResponse {
  list: OwmForecastItem[];
  city: {
    id: number;
    name: string;
    country: string;
    timezone: number;
  };
}
