import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { Habit } from '../models/habit.model';
import { CompletionStore, HabitCompletion, HabitStats } from '../models/completion.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private readonly HABITS_KEY = 'habits';
  private readonly COMPLETIONS_KEY = 'completions';

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  private completionsSubject = new BehaviorSubject<CompletionStore>({});

  habits$ = this.habitsSubject.asObservable();
  completions$ = this.completionsSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadData();
  }

  /**
   * Carrega os dados iniciais do armazenamento
   */
  private loadData(): void {
    const habits = this.storageService.getItem<Habit[]>(this.HABITS_KEY, []) ?? [];
    const completions = this.storageService.getItem<CompletionStore>(this.COMPLETIONS_KEY, {}) ?? {};
    
    this.habitsSubject.next(habits);
    this.completionsSubject.next(completions);
  }

  /**
   * Salva um novo hábito
   */
  addHabit(habit: Omit<Habit, 'id' | 'createdAt'>): Habit {
    const habits = this.habitsSubject.value;
    
    const newHabit: Habit = {
      ...habit,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    const updatedHabits = [...habits, newHabit];
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    return newHabit;
  }

  /**
   * Atualiza um hábito existente
   */
  updateHabit(id: string, updates: Partial<Habit>): boolean {
    const habits = this.habitsSubject.value;
    const index = habits.findIndex(h => h.id === id);
    
    if (index === -1) return false;
    
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], ...updates };
    
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    return true;
  }

  /**
   * Remove um hábito
   */
  deleteHabit(id: string): boolean {
    const habits = this.habitsSubject.value;
    const completions = this.completionsSubject.value;
    
    if (!habits.some(h => h.id === id)) return false;
    
    // Remove o hábito
    const updatedHabits = habits.filter(h => h.id !== id);
    this.habitsSubject.next(updatedHabits);
    this.storageService.setItem(this.HABITS_KEY, updatedHabits);
    
    // Remove as conclusões relacionadas
    const { [id]: _, ...updatedCompletions } = completions;
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Marca um hábito como concluído na data especificada
   */
  completeHabit(habitId: string, date = new Date().toISOString().split('T')[0]): boolean {
    const habits = this.habitsSubject.value;
    const completions = this.completionsSubject.value;
    
    // Verifica se o hábito existe
    if (!habits.some(h => h.id === habitId)) return false;
    
    const habitCompletions = completions[habitId] || [];
    
    // Verifica se já foi concluído nesta data
    if (habitCompletions.includes(date)) return false;
    
    // Adiciona a conclusão
    const updatedCompletions = {
      ...completions,
      [habitId]: [...habitCompletions, date]
    };
    
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Remove a marcação de conclusão de um hábito
   */
  uncompleteHabit(habitId: string, date: string): boolean {
    const completions = this.completionsSubject.value;
    const habitCompletions = completions[habitId];
    
    if (!habitCompletions || !habitCompletions.includes(date)) return false;
    
    const updatedCompletions = {
      ...completions,
      [habitId]: habitCompletions.filter(d => d !== date)
    };
    
    this.completionsSubject.next(updatedCompletions);
    this.storageService.setItem(this.COMPLETIONS_KEY, updatedCompletions);
    
    return true;
  }

  /**
   * Verifica se um hábito foi concluído em uma data específica
   */
  isHabitCompletedOnDate(habitId: string, date = new Date().toISOString().split('T')[0]): boolean {
    const completions = this.completionsSubject.value;
    const habitCompletions = completions[habitId] || [];
    
    return habitCompletions.includes(date);
  }

  /**
   * Obtém as estatísticas de um hábito específico
   */
  getHabitStats(habitId: string): Observable<HabitStats | null> {
    return this.completions$.pipe(
      map(completions => {
        const habit = this.habitsSubject.value.find(h => h.id === habitId);
        if (!habit) return null;
        
        const habitCompletions = completions[habitId] || [];
        const totalCompletions = habitCompletions.length;
        
        // Ordenar as datas para cálculos
        const sortedDates = [...habitCompletions].sort();
        const lastCompleted = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : undefined;
        
        // Calcula a sequência atual
        const streak = this.calculateStreak(habitId, completions);
        
        // Calcula a taxa de conclusão
        // Para simplificar, usamos o número de dias desde a criação do hábito
        const creationDate = new Date(habit.createdAt).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const totalDaysSinceCreation = this.daysBetween(creationDate, today) + 1;
        
        const completionRate = totalDaysSinceCreation > 0 ? 
          (totalCompletions / totalDaysSinceCreation) * 100 : 0;
        
        return {
          habitId,
          streak,
          completionRate,
          lastCompleted,
          totalCompletions
        };
      })
    );
  }

  /**
   * Calcula a sequência atual de um hábito
   */
  private calculateStreak(habitId: string, completions: CompletionStore): number {
    const habitCompletions = completions[habitId] || [];
    if (habitCompletions.length === 0) return 0;
    
    // Converte as datas para objetos Date para facilitar a comparação
    const dates = habitCompletions.map(date => new Date(date));
    dates.sort((a, b) => a.getTime() - b.getTime());
    
    // Verifica se o hábito foi concluído hoje ou ontem
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const latestDate = dates[dates.length - 1];
    const latestDateDay = new Date(latestDate);
    latestDateDay.setHours(0, 0, 0, 0);
    
    // Se a última conclusão não foi nem hoje nem ontem, não há sequência ativa
    if (latestDateDay.getTime() !== today.getTime() && 
        latestDateDay.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Calcula a sequência contando dias consecutivos
    let streak = 1;
    let currentDate = latestDateDay;
    
    for (let i = dates.length - 2; i >= 0; i--) {
      const prevDate = new Date(dates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const expectedPrevDate = new Date(currentDate);
      expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
      
      if (prevDate.getTime() === expectedPrevDate.getTime()) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Calcula o número de dias entre duas datas
   */
  private daysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
