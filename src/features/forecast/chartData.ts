import type { Forecast } from './types';

const SECONDS_PER_DAY = 86_400;

interface ChartPoint {
  time: number;
  temp: number;
  feelsLike: number;
}

interface ChartData {
  points: ChartPoint[];
  ticks: number[];
  midnights: number[];
  min: number;
  max: number;
  degrees: number[];
}

const roundTicks = (min: number, max: number) => {
  const step = max - min > 30 ? 10 : 5;
  const from = Math.floor(min / step) * step;
  const count = Math.ceil(max / step) - from / step + 1;
  return Array.from({ length: count }, (_, index) => from + index * step);
};

const startOfDay = (time: number) => time - (time % SECONDS_PER_DAY);

export const toChartData = ({ days }: Forecast): ChartData => {
  const points = days.flatMap((day) => day.slots.map(({ time, temp, feelsLike }) => ({ time, temp, feelsLike })));
  const temps = points.flatMap((point) => [point.temp, point.feelsLike]);
  const [min, max] = [Math.min(...temps), Math.max(...temps)];
  return {
    points,
    ticks: days.map((day) => day.date),
    midnights: days.slice(1).map((day) => startOfDay(day.date)),
    min,
    max,
    degrees: roundTicks(min, max),
  };
};
