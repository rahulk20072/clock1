export enum AppMode {
  CLOCK = 'CLOCK',
  TIMER = 'TIMER',
  STOPWATCH = 'STOPWATCH'
}

export interface TimeState {
  hours: string;
  minutes: string;
  seconds: string;
  period: string; // AM/PM
  fullDate: string;
}

export interface AIInsightState {
  text: string | null;
  loading: boolean;
  error: string | null;
}
