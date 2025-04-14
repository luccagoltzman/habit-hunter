export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: Frequency;
  createdAt: string;
}

export enum Frequency {
  DAILY = 'Diário',
  WEEKLY = 'Semanal',
  MONTHLY = 'Mensal',
  CUSTOM = 'Personalizado'
}

export interface CustomFrequency {
  type: 'week' | 'month';
  timesPerPeriod: number;
} 