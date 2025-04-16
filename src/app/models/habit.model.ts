export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: Frequency;
  createdAt: string;
  weekDays?: number[];
  countGoal?: number;
  currentCount?: number;
  useChecklist?: boolean;
  checklistItems?: boolean[];
  checklistItemNames?: string[];
}

export enum Frequency {
  DAILY = 'Diário',
  WEEKLY = 'Semanal',
  SPECIFIC_DAYS = 'Dias Específicos',
  MONTHLY = 'Mensal',
  CUSTOM = 'Personalizado'
}

export interface CustomFrequency {
  type: 'week' | 'month';
  timesPerPeriod: number;
}

export interface WeekDay {
  value: number;
  name: string;
  shortName: string;
} 