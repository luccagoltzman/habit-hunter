export interface CompletionStore {
  [habitId: string]: string[]; // Array de datas em formato ISO ("YYYY-MM-DD")
}

export interface HabitCompletion {
  habitId: string;
  date: string; // Formato ISO ("YYYY-MM-DD")
}

export interface HabitStats {
  habitId: string;
  streak: number; // Dias consecutivos
  completionRate: number; // Porcentagem de conclusão
  lastCompleted?: string; // Última vez concluído (formato ISO)
  totalCompletions: number; // Total de conclusões
} 